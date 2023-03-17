async function saveFile(data) {
  const fs = await import("fs");

  return new Promise((resolve, reject) => {
    fs.writeFile(
      "exported/output.json",
      JSON.stringify(data, null, 2),
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log("Data successfully written to file!");
        resolve();
      }
    );
  });
}

module.exports = { saveFile };
