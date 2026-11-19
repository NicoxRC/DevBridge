from datetime import datetime, timedelta, timezone

import jwt

from app.auth import SECRET, create_token, decode_token, hash_password, verify_password


class TestPasswords:
    def test_accepts_the_right_password(self):
        hashed = hash_password("devbridge123")

        assert hashed != "devbridge123"
        assert verify_password("devbridge123", hashed)

    def test_rejects_a_wrong_password(self):
        assert not verify_password("wrong-password", hash_password("devbridge123"))


class TestTokens:
    def test_token_carries_the_user_id(self):
        assert decode_token(create_token(42, "developer")) == 42

    def test_rejects_invalid_or_expired_tokens(self):
        expired = jwt.encode(
            {"sub": "42", "exp": datetime.now(timezone.utc) - timedelta(minutes=1)}, SECRET, algorithm="HS256"
        )

        assert decode_token(expired) is None
        assert decode_token("not-a-token") is None
