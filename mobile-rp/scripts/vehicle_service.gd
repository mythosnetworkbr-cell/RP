class_name NyxVehicleService
extends RefCounted

static func create(vehicle_id: String, position: Vector3) -> Dictionary:
    return {
        "id": vehicle_id,
        "position": position,
        "fuel": 100.0,
        "health": 100.0,
        "locked": false,
        "engine": true
    }

static func repair(vehicle: Dictionary) -> Dictionary:
    var result := vehicle.duplicate(true)
    result["health"] = 100.0
    result["engine"] = true
    return result
