// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const AWS = require('aws-sdk');
const config = require('./config');

/**
 * S3Upload Class
 * Upload a recording artifact to S3
 */
class S3Uploader {
    /**
     * @constructor
     * @param {*} bucket - the S3 bucket name uploaded to
     * @param {*} key - the file name in S3 bucket
     */
    constructor(key) {
        this.key = key;
        this.s3Uploader = new AWS.S3({
            accessKeyId: config['S3_KEY'],
            secretAccessKey: config['S3_SECRET'],
            Bucket: config['S3_BUCKET'],
            params: {Key: key}
        });
        console.log(`[upload process] constructed a S3 object with key: ${this.key}`);
    }

    uploadStream(stream) {
        const managedUpload = this.s3Uploader.upload({ Body: stream }, (err, data) => {
            if (err) {
                console.log('[stream upload process] - failure - error handling on failure', err);
            } else {
                console.log(`[stream upload process] - success - uploaded the file to: ${data.Location}`);
                process.exit();
            }
        });
        managedUpload.on('httpUploadProgress', function (event) {
            console.log(`[stream upload process]: on httpUploadProgress ${event.loaded} bytes`);
        });
    }
}

module.exports = {
    S3Uploader
};