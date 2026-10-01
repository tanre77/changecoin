export type WalletMethod = "apple" | "google";
export type WalletResult = "sheet" | "unavailable" | "cancel";

export async function openWallet(
  method: WalletMethod,
  cents: number,
  label: string,
): Promise<WalletResult> {
  if (typeof window === "undefined" || !("PaymentRequest" in window)) return "unavailable";
  const amount = (Math.max(0, cents) / 100).toFixed(2);
  const methodData =
    method === "apple"
      ? [
          {
            supportedMethods: "https://apple.com/apple-pay",
            data: {
              version: 3,
              merchantIdentifier: "merchant.changecoin.preview",
              merchantCapabilities: ["supports3DS"],
              supportedNetworks: ["visa", "masterCard"],
              countryCode: "US",
            },
          },
        ]
      : [
          {
            supportedMethods: "https://google.com/pay",
            data: {
              environment: "TEST",
              apiVersion: 2,
              apiVersionMinor: 0,
              allowedPaymentMethods: [
                {
                  type: "CARD",
                  parameters: {
                    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                    allowedCardNetworks: ["VISA", "MASTERCARD"],
                  },
                },
              ],
            },
          },
        ];
  try {
    const request = new PaymentRequest(methodData, {
      total: { label, amount: { currency: "USD", value: amount } },
    });
    if (request.canMakePayment) {
      const ok = await request.canMakePayment();
      if (!ok) return "unavailable";
    }
    const response = await request.show();
    await response.complete("unknown");
    return "sheet";
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") return "cancel";
    return "unavailable";
  }
}

export function walletHint() {
  const ua = typeof navigator === "undefined" ? "" : navigator.userAgent;
  const apple = /iPhone|iPad/.test(ua);
  const android = /Android/.test(ua);
  if (apple) return "Apple Pay opens in Safari once a merchant ID is on the store build.";
  if (android) return "Google Pay opens in Chrome once a merchant ID is on the store build.";
  return "Wallets open on iPhone (Safari) and Android (Chrome). This preview does not charge a card.";
}
