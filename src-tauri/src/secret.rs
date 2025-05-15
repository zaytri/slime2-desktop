use keyring::Entry;

pub static KEYRING_SERVICE_NAME: &str = "slime2.stream";

pub fn get_secret(key: &str) -> keyring::Result<String> {
	Entry::new(KEYRING_SERVICE_NAME, key)?.get_password()
}

pub fn set_secret(key: &str, value: &str) -> keyring::Result<()> {
	Entry::new(KEYRING_SERVICE_NAME, key)?.set_password(value)
}

pub fn delete_secret(key: &str) -> keyring::Result<()> {
	Entry::new(KEYRING_SERVICE_NAME, key)?.delete_credential()
}
