import * as forge from 'node-forge';
export class KeyPair {
  public;
  private;
}

export function generateKeyPair() {
  return new Promise((resolve, reject) => {
    forge.pki.rsa.generateKeyPair({bits: 4096, workers: -1}, (forgeError, keypair) => {
      if (forgeError) {
        reject(new Error(`Failed to generate SSH key: ${forgeError}`));
      }
      resolve({
        public: forge.ssh.publicKeyToOpenSSH(keypair.publicKey, '').trim(),
        private: forge.ssh.privateKeyToOpenSSH(keypair.privateKey, '').trim(),
      });
    });
  });
}
