// import pkg from './node_modules/libsodium-wrappers/dist/modules/libsodium-wrappers.js';
const pkg = require('libsodium-wrappers');
var fs = require('fs');
const bodyParser = require('body-parser');
const express = require ('express');
const router = express.Router();
let on_searchData = require('./on_search');
// import _ from './node_modules/lodash'
// import onsearchData from "./on_search.json" assert {type: "json"};
// const osData = onsearchData
const _sodium = pkg
const {base64_variants} = pkg

router.post('/', async(req, res) => {

//--createSigningString function
const createSigningString = async (message, created, expires) => {
   if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
   if (!expires) expires = (parseInt(created) + (24 * 60 * 60)).toString(); //Add required time to create expired
   await _sodium.ready;
   const sodium = _sodium;
   const digest = sodium.crypto_generichash(64, sodium.from_string(message));
   const digest_base64 = sodium.to_base64(digest, base64_variants.ORIGINAL);
   const signing_string =
`(created): ${created}
(expires): ${expires}
digest: BLAKE-512=${digest_base64}`
   console.log(signing_string);
   return { signing_string, expires, created }
}


//---signMessage function
const signMessage = async (signing_string, privateKey) => {
   await _sodium.ready;
   const sodium = _sodium;
   const signedMessage = sodium.crypto_sign_detached(signing_string, sodium.from_base64(privateKey, base64_variants.ORIGINAL));
   const abc = sodium.to_base64(signedMessage, base64_variants.ORIGINAL);
   console.log("signatureKey=" + abc);
   return abc
}

//-- createAuthorizationHeader function
const createAuthorizationHeader = async (message) => {
   const { signing_string, expires, created } = await createSigningString(JSON.stringify(message));
   const signature = await signMessage(signing_string, process.env.sign_private_key || "BUh0IblywQ8MEy9QV3ZoY2R8Ohr4OrtwSkjDxAuDtCc=");
   const subscriber_id = "bybest.in";
   const header = `Signature keyId="${subscriber_id}|355|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`
   // console.log(header);
   //console.log(osData);
   return header;
}

//createAuthorizationHeader(on_searchData);

const headerval = await createAuthorizationHeader(req.body);
    //console.log(req.body);
    // fs.writeFileSync('searchRequest.json', JSON.stringify(req.body, null, 2));
    console.log(headerval);
    // res.send(headerval)
    res.status(200).send(headerval)
});

module.exports=router;


