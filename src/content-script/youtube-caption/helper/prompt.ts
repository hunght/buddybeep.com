export function getSummaryPrompt(transcript: any, documentTitle: string) {
  return `Title: "${documentTitle
    .replace(/\n+/g, ' ')
    .trim()}"\nVideo Transcript: "${truncateTranscript(transcript)
    .replace(/\n+/g, ' ')
    .trim()}"\nVideo Summary:`;
}

// Seems like 15,000 bytes is the limit for the prompt
const limit = 14000; // 1000 is a buffer

type TextData = {
  text: string;
  index: number;
};

export function getChunckedTranscripts(
  textData: TextData[],
  textDataOriginal: TextData[]
): string {
  // [Thought Process]
  // (1) If text is longer than limit, then split it into chunks (even numbered chunks)
  // (2) Repeat until it's under limit
  // (3) Then, try to fill the remaining space with some text
  // (eg. 15,000 => 7,500 is too much chuncked, so fill the rest with some text)

  let result = '';
  const text = textData
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((t: { text: any }) => t.text)
    .join(' ');

  const bytes = textToBinaryString(text).length;

  if (bytes > limit) {
    // Get only even numbered chunks from textArr
    const evenTextData = textData.filter((t: any, i: number) => i % 2 === 0);
    result = getChunckedTranscripts(evenTextData, textDataOriginal);
  } else {
    // Check if any array items can be added to result to make it under limit but really close to it
    if (textDataOriginal.length !== textData.length) {
      textDataOriginal.forEach((obj, i: number) => {
        if (textData.some((t: { text: any }) => t.text === obj.text)) {
          return;
        }

        textData.push(obj);

        const newText = textData
          .sort(
            (a: { index: number }, b: { index: number }) => a.index - b.index
          )
          .map((t: { text: any }) => t.text)
          .join(' ');
        const newBytes = textToBinaryString(newText).length;

        if (newBytes < limit) {
          const nextText = textDataOriginal[i + 1];
          const nextTextBytes = textToBinaryString(nextText.text).length;

          if (newBytes + nextTextBytes > limit) {
            const overRate = (newBytes + nextTextBytes - limit) / nextTextBytes;
            const chunkedText = nextText.text.substring(
              0,
              Math.floor(nextText.text.length * overRate)
            );
            textData.push({ text: chunkedText, index: nextText.index });
            result = textData
              .sort(
                (a: { index: number }, b: { index: number }) =>
                  a.index - b.index
              )
              .map((t: { text: any }) => t.text)
              .join(' ');
          } else {
            result = newText;
          }
        }
      });
    } else {
      result = text;
    }
  }

  const originalText = textDataOriginal
    .sort((a: { index: number }, b: { index: number }) => a.index - b.index)
    .map((t: { text: any }) => t.text)
    .join(' ');
  return result === '' ? originalText : result; // Just in case the result is empty
}

function truncateTranscript(str: string): string {
  const bytes = textToBinaryString(str).length;
  if (bytes > limit) {
    const ratio = limit / bytes;
    const newStr = str.substring(0, str.length * ratio);
    return newStr;
  }
  return str;
}

function textToBinaryString(str: string) {
  let escstr = decodeURIComponent(encodeURIComponent(escape(str)));
  let binstr = escstr.replace(/%([0-9A-F]{2})/gi, function (match, hex) {
    let i = parseInt(hex, 16);
    return String.fromCharCode(i);
  });
  return binstr;
}
