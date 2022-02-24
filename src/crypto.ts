import sodium, { crypto_hash, KeyPair } from 'libsodium-wrappers';
import { entropyToMnemonic, mnemonicToEntropy } from 'bip39';
import { encodeUTF8, decodeBase64, encodeBase64 } from 'tweetnacl-util';

export const generateMnemonic = (): string => {
  const length = sodium.crypto_sign_SEEDBYTES;
  const entropy = sodium.randombytes_buf(length, 'uint8array');
  return entropyToMnemonic(entropy as Buffer);
};

export const generateEntropy = (): Uint8Array => {
  const length = sodium.crypto_sign_SEEDBYTES;
  return sodium.randombytes_buf(length, 'uint8array');
};

export const generateKeyPair: (seedPhrase: string) => KeyPair = (seedPhrase: string) => {
  const entropy = mnemonicToEntropy(seedPhrase);
  const encodedEntropy = Uint8Array.from(Buffer.from(entropy, 'hex'));
  return sodium.crypto_box_seed_keypair(encodedEntropy);
};

export const encrypt = (
  privateEncryptionKey: Uint8Array,
  publicEncryptionKey: Uint8Array,
  plainText: string | Uint8Array
): {
  nonce: Uint8Array;
  cipher: Uint8Array;
} => {
  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES);
  const cipher = sodium.crypto_box_easy(plainText, nonce, publicEncryptionKey, privateEncryptionKey);
  return { nonce, cipher };
};

export const decrypt = (
  encryptedMessage: Uint8Array,
  nonce: Uint8Array,
  privateEncryptionKey: Uint8Array,
  publicEncryptionKey: Uint8Array
): string => {
  const decryptedData = sodium.crypto_box_open_easy(encryptedMessage, nonce, publicEncryptionKey, privateEncryptionKey);
  return encodeUTF8(decryptedData);
};

export const hashData = (data: string): string => {
  return encodeBase64(crypto_hash(data));
};
