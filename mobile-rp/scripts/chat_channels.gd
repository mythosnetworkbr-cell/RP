class_name NyxChatChannels
extends RefCounted

static func visible(channel: String, is_admin: bool, organization: String, target_organization: String) -> bool:
    match channel:
        "global":
            return true
        "admin":
            return is_admin
        "organization":
            return not organization.is_empty() and organization == target_organization
        "support":
            return is_admin
        _:
            return false
