const major = Number(process.versions.node.split(".")[0]);

if (major < 18) {
  console.error(
    [
      "",
      "❌ Для E2E-тестов нужен Node.js 18 или новее.",
      `   Сейчас: ${process.version}`,
      "",
      "   Если установлен nvm:",
      "     nvm install 18",
      "     nvm use",
      "     npm install",
      "     npm run playwright:install",
      "     npm run test:e2e:watch",
      "",
    ].join("\n"),
  );
  process.exit(1);
}
