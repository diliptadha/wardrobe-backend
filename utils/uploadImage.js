import fs from "fs";

export const imageUpload = async (filePath) => {
  const form = new FormData();
  const fileBuffer = await readFileAsync(filePath);
  const base64Data = fileBuffer.toString("base64");

  form.append("image", base64Data);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
    {
      method: "POST",
      body: form,
    }
  );

  const data = await res.json();
  if (data.success) {
    return data.data.url;
  } else {
    console.log(data);
    throw new Error(data.error.message);
  }
};

const readFileAsync = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};
