// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const AWS = require('aws-sdk');
const request = require('request');

/**
 * S3Upload Class
 * Upload a recording artifact to S3
 */
class S3Uploader {
    /**
     * @constructor
     * @param {*} bucket - the S3 bucket name uploaded to
     * @param {*} key - the file name in S3 bucket
     * @param {*} serverName - the meeting url serverName
     * @param {*} eventCode - the meeting url eventCode
     * @param {*} token - the meeting url token
     */
    constructor(bucket, key, serverName, eventCode, token) {
        this.bucket = bucket;
        this.key = key;
        this.s3Uploader = new AWS.S3({ params: { Bucket: bucket, Key: key } });
        this.serverName = serverName;
        this.eventCode = eventCode;
        this.token = token;
        console.log(`[upload process] constructed a S3 object with bucket: ${this.bucket}, key: ${this.key}, serverName: ${this.serverName}, eventCode: ${this.eventCode}, token: ${this.token}`);
    }

    sendStopRecordData() {
        const requestURL =  this.serverName + '/stop-recording';
        const stopRecordData = {
            eventCode: this.eventCode,
            token: this.token,
            fileName: this.key
        }
        const options = {
            url: requestURL,
            method: 'POST',
            body: stopRecordData,
            json: true,
        };
        request(options, function (error, response) {
            if (error) return console.log(error);
            console.log('Send stop record data to server success');
        });
    }

    uploadStream(stream) {
        const managedUpload = this.s3Uploader.upload({ Body: stream }, (err, data) => {
            if (err) {
                console.log('[stream upload process] - failure - error handling on failure', err);
            } else {
                console.log(`[stream upload process] - success - uploaded the file to: ${data.Location}`);
                this.sendStopRecordData();
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