//keep write smooth
async function typeTextWithMultiplier(text, baseSpeed = 100) {
  const divisor = text.length % 10 === 0 ? text.length / 10 : 1;
  for (let char of text) {
    process.stdout.write(char);
    await new Promise((resolve) => setTimeout(resolve, baseSpeed / divisor));
  }
}

//typeTextWithMultiplier("1234567890");
//typeTextWithMultiplier("12345678901234567890");
typeTextWithMultiplier("123456789012345678901234567890");
