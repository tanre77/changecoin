import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { pollSignals, postSignal, type SignalRow } from "@/lib/changecoin.functions";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export function VideoRoom({ initialRoom }: { initialRoom?: string }) {
  const { user, isPending } = useCurrentUserState();
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const tabRef = useRef(Math.random().toString(36).slice(2, 8));
  const sinceRef = useRef(0);
  const senderRef = useRef("");
  const [room, setRoom] = useState(initialRoom || "");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("Camera is off. Nothing is recorded.");

  useEffect(() => {
    if (initialRoom) setRoom(initialRoom);
  }, [initialRoom]);

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  function stopMedia() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
  }

  async function preview() {
    if (!consent) {
      setStatus("Confirm the camera note first.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;
      if (localRef.current) localRef.current.srcObject = stream;
      setStatus("Local preview only. Join when the other person has the room code.");
    } catch {
      setStatus("Camera or microphone permission was blocked. You can still keep the visit on the calendar.");
    }
  }

  async function join() {
    const code = room.trim().toUpperCase();
    if (!/^[A-Z0-9]{4,12}$/.test(code)) {
      setStatus("Enter the room code from the visit.");
      return;
    }
    if (!user) {
      setStatus("Sign in with your Grok account to connect the other person. A local preview still works.");
      return;
    }
    if (!streamRef.current) await preview();
    if (!streamRef.current) return;
    stopPeerOnly();
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pcRef.current = pc;
    streamRef.current.getTracks().forEach((track) => pc.addTrack(track, streamRef.current as MediaStream));
    pc.ontrack = (event) => {
      if (remoteRef.current) remoteRef.current.srcObject = event.streams[0] ?? null;
    };
    pc.oniceconnectionstatechange = () => setStatus(`Call ${pc.iceConnectionState}.`);
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      void postSignal({
        data: { room: code, tab: tabRef.current, kind: "ice", payload: JSON.stringify(event.candidate) },
      }).catch(() => undefined);
    };
    setStatus("Waiting for the other person.");
    try {
      const here = await postSignal({
        data: { room: code, tab: tabRef.current, kind: "here", payload: "here" },
      });
      senderRef.current = here.sender;
    } catch {
      setStatus("Sign in to place the call. The preview did not leave this device.");
      return;
    }
    const timer = window.setInterval(() => {
      void pump(code, pc);
    }, 2000);
    pc.addEventListener("connectionstatechange", () => {
      if (pc.connectionState === "closed" || pc.connectionState === "failed") {
        window.clearInterval(timer);
      }
    });
  }

  function stopPeerOnly() {
    pcRef.current?.close();
    pcRef.current = null;
  }

  async function pump(code: string, pc: RTCPeerConnection) {
    let rows: SignalRow[] = [];
    try {
      rows = await pollSignals({ data: { room: code, since: sinceRef.current } });
    } catch {
      return;
    }
    for (const row of rows) {
      sinceRef.current = Math.max(sinceRef.current, row.id);
      if (row.sender === senderRef.current) continue;
      if (row.kind === "here" && pc.signalingState === "stable" && !pc.currentRemoteDescription) {
        if (senderRef.current < row.sender) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await postSignal({
            data: { room: code, tab: tabRef.current, kind: "offer", payload: offer.sdp ?? "" },
          });
        }
      } else if (row.kind === "offer" && row.payload) {
        await pc.setRemoteDescription({ type: "offer", sdp: row.payload });
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        await postSignal({
          data: { room: code, tab: tabRef.current, kind: "answer", payload: answer.sdp ?? "" },
        });
      } else if (row.kind === "answer" && row.payload && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription({ type: "answer", sdp: row.payload });
      } else if (row.kind === "ice" && row.payload) {
        try {
          await pc.addIceCandidate(JSON.parse(row.payload) as RTCIceCandidateInit);
        } catch {
          // A late candidate can arrive before the description. The next poll retries nothing harmful.
        }
      }
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div>
        <h2 className="font-display text-2xl">Video visit</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Two people, one room code. ChangeCoin does not record the call. Camera and microphone are used
          only after you start. Leave if you feel unsafe.
        </p>
      </div>
      <label className="flex min-h-11 items-start gap-3 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-1 size-4"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        I agree this visit is not emergency care, and I will not record it.
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <video ref={localRef} autoPlay playsInline muted className="aspect-video w-full rounded-md bg-subtle" />
        <video ref={remoteRef} autoPlay playsInline className="aspect-video w-full rounded-md bg-subtle" />
      </div>
      <label className="block text-sm font-medium" htmlFor="room-code">
        Room code
      </label>
      <input
        id="room-code"
        value={room}
        onChange={(event) => setRoom(event.target.value.toUpperCase())}
        className="h-11 w-full rounded-md border border-border bg-background px-3 text-base tracking-widest"
        autoComplete="off"
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => void preview()} disabled={!consent}>
          Preview camera
        </Button>
        <Button variant="secondary" onClick={() => void join()} disabled={!consent || isPending}>
          Join call
        </Button>
        <Button
          variant="quiet"
          onClick={() => {
            stopMedia();
            setStatus("Call ended on this device.");
          }}
        >
          End
        </Button>
      </div>
      <p className="text-sm text-muted">{status}</p>
    </section>
  );
}
