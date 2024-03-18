import { getTranscriptHTML } from "./transcipt"
import { getRawTranscript } from "./transcript"

const link =
  "https://www.youtube.com/api/timedtext?v=AS4h00y7Rh0&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1684967459&sparams=ip,ipbits,expire,v,caps,opi,xoaf&signature=11289C0ED141D2DC3907AC917E78AF6D94A6909B.D1B6F8F8A1F4A20A584559F7A0AD056BEBBEA109&key=yt8&lang=en-GB"

test("should first", async () => {
  const rawTranscript = await getTranscriptHTML(link)
  expect(rawTranscript[0].text).toBe("Grown all over these mountains")
})
