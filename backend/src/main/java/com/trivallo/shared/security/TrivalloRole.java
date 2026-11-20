package com.trivallo.shared.security;

import java.util.Arrays;

/** Realm roles defined in Keycloak's {@code trivallo} realm. */
public enum TrivalloRole {
    TRAVELLER,
    ADMIN;

    static boolean isKnown(String role) {
        return Arrays.stream(values()).anyMatch(known -> known.name().equals(role));
    }
}
