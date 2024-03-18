import { getLangOptionsWithLink, getRawTranscript } from "./transcript"
import { copyTranscriptAndPrompt } from "./youtube"

test("should first", async () => {
  const langOptionsWithLink = await getLangOptionsWithLink("QmOF0crdyRU")
  const rawTranscript = await getRawTranscript(langOptionsWithLink[0].link)
  const prompt = copyTranscriptAndPrompt(
    rawTranscript,
    "Controlling Your Dopamine For Motivation, Focus & Satisfaction | Huberman Lab Podcast #39"
  )
  expect(rawTranscript[0].text).toBe("Grown all over these mountains")
})
