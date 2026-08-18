class_name NyxAdminService
extends RefCounted

const ASSISTANT := 1
const SUPPORT := 2
const ADMIN := 3
const ADMIN2 := 4
const LEADER := 5
const OWNER := 6

static func can_admin(level: int) -> bool:
    return level >= ADMIN

static func can_spawn(level: int) -> bool:
    return level >= ADMIN2

static func can_manage_staff(level: int) -> bool:
    return level >= LEADER

static func can_ban_ip(level: int) -> bool:
    return level >= LEADER

static func can_owner(level: int) -> bool:
    return level >= OWNER
