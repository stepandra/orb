# Keys
If you intend to use TLS, folder should contain two files named *key.pem* and *cert.pem*:
- `key.pem` contains the private key.
- `cert.pem` contains the certificate.
These can be created using OpenSSL with the following set of commands:
```
openssl genrsa -out key.pem
openssl req -new -key key.pem -out csr.pem
openssl x509 -req -days 9999 -in csr.pem -signkey key.pem -out cert.pem
rm csr.pem
```

The server checks if they exist at startup and uses the according protocol (HTTP/HTTPS).