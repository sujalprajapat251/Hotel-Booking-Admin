const s3 = require("./s3Config.js");
const { v4: uuid } = require("uuid");

exports.uploadToS3 = async (file, folder) => {
  if (!file) return null;

  const fileKey = `${folder}/${Date.now()}-${uuid()}-${file.originalname.replace(/\s/g, "")}`;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  const upload = await s3.upload(params).promise();
  return upload.Location;
};

exports.updateS3 = async (oldKey, newFile, folder) => {

  if (oldKey) {
    await this.deleteFromS3(oldKey);
  }

  return await this.uploadToS3(newFile, folder);
};

exports.deleteFromS3 = async (fileKey) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: fileKey
  };

  return await s3.deleteObject(params).promise();
};

exports.deleteManyFromS3 = async (keys = []) => {
  if (!keys.length) return;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key }))
    }
  };

  return await s3.deleteObjects(params).promise();
};

exports.listBucketObjects = async () => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
  };

  const data = await s3.listObjectsV2(params).promise();

  const region = process.env.AWS_REGION;
  const bucket = process.env.AWS_BUCKET_NAME;

  const files = data.Contents.map(file => {
    const url = `https://${bucket}.s3.${region}.amazonaws.com/${file.Key}`;
    return {
      key: file.Key,
      url,
      size: file.Size,
      lastModified: file.LastModified
    };
  });

  return files;

};
