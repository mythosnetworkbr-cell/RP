extends Node3D

const PLAYER := preload("res://scripts/player.gd")
const HUD := preload("res://scripts/hud.gd")
const CAR := preload("res://scripts/vehicle.gd")
var state: Node

func _ready() -> void:
    _environment()
    _city()
    _street_lights()

    var car := CAR.new()
    car.position = Vector3(7, 0.45, 7)
    car.name = "Vehicle"
    add_child(car)

    var player := PLAYER.new()
    player.name = "Player"
    player.position = Vector3(0, 1.2, 12)
    add_child(player)

    var hud := HUD.new()
    hud.name = "HUD"
    hud.player = player
    hud.state = state
    hud.vehicle = car
    add_child(hud)

func _environment() -> void:
    var world := WorldEnvironment.new()
    var env := Environment.new()
    env.background_mode = Environment.BG_COLOR
    env.background_color = Color(0.025, 0.035, 0.065)
    env.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
    env.ambient_light_color = Color(0.60, 0.66, 0.80)
    env.ambient_light_energy = 0.9
    world.environment = env
    add_child(world)

    var sun := DirectionalLight3D.new()
    sun.rotation_degrees = Vector3(-48, -25, 0)
    sun.light_energy = 1.25
    sun.shadow_enabled = true
    add_child(sun)

func _city() -> void:
    _box("Ground", Vector3(150, 0.4, 150), Vector3(0, -0.2, 0), Color(0.075, 0.085, 0.10))
    _box("RoadX", Vector3(150, 0.08, 18), Vector3(0, 0.02, 0), Color(0.022, 0.024, 0.028))
    _box("RoadZ", Vector3(18, 0.08, 150), Vector3(0, 0.025, 0), Color(0.022, 0.024, 0.028))
    _box("SidewalkX1", Vector3(150, 0.16, 2.2), Vector3(0, 0.10, 10.1), Color(0.18, 0.18, 0.20))
    _box("SidewalkX2", Vector3(150, 0.16, 2.2), Vector3(0, 0.10, -10.1), Color(0.18, 0.18, 0.20))
    _box("SidewalkZ1", Vector3(2.2, 0.16, 150), Vector3(10.1, 0.10, 0), Color(0.18, 0.18, 0.20))
    _box("SidewalkZ2", Vector3(2.2, 0.16, 150), Vector3(-10.1, 0.10, 0), Color(0.18, 0.18, 0.20))

    for i in range(-60, 61, 12):
        _box("LaneMark", Vector3(5.5, 0.035, 0.18), Vector3(i, 0.08, 0), Color(0.9, 0.75, 0.18))
        _box("LaneMark", Vector3(0.18, 0.035, 5.5), Vector3(0, 0.08, i), Color(0.9, 0.75, 0.18))

    var blocks := [-50.0, -36.0, -22.0, 22.0, 36.0, 50.0]
    for x in blocks:
        for z in blocks:
            var h := 7.0 + float(int(abs(x * 3.0 + z)) % 15)
            var width := 9.0 + float(int(abs(x + z)) % 3)
            var c := Color(0.12 + float(int(abs(x)) % 4) * 0.02, 0.14, 0.19 + float(int(abs(z)) % 3) * 0.02)
            _box("Building", Vector3(width, h, width), Vector3(x, h / 2.0, z), c)
            _box("Roof", Vector3(width + 0.2, 0.20, width + 0.2), Vector3(x, h + 0.12, z), Color(0.045, 0.055, 0.075))
            for wy in range(2, int(h), 3):
                _box("WindowBand", Vector3(width + 0.01, 0.7, 0.08), Vector3(x, float(wy), z - width / 2.0 - 0.02), Color(0.16, 0.22, 0.30))

    _box("NyxStore", Vector3(12, 4, 9), Vector3(25, 2, 26), Color(0.22, 0.08, 0.34))
    _box("Police", Vector3(14, 5, 11), Vector3(-26, 2.5, 26), Color(0.055, 0.12, 0.23))
    _box("Hospital", Vector3(14, 6, 13), Vector3(26, 3, -26), Color(0.18, 0.18, 0.21))
    _box("CityHall", Vector3(16, 7, 13), Vector3(-26, 3.5, -26), Color(0.20, 0.17, 0.12))

    for p in [Vector3(25,0,26), Vector3(-26,0,26), Vector3(26,0,-26), Vector3(-26,0,-26)]:
        _box("Sign", Vector3(4, 1.4, 0.18), p + Vector3(0, 5.2, 4.7), Color(0.35, 0.25, 0.75))

func _street_lights() -> void:
    for i in range(-50, 51, 10):
        _lamp(Vector3(i, 0, 12))
        _lamp(Vector3(i, 0, -12))
        _lamp(Vector3(12, 0, i))
        _lamp(Vector3(-12, 0, i))

func _lamp(pos: Vector3) -> void:
    _box("LampPole", Vector3(0.12, 3.5, 0.12), pos + Vector3(0, 1.75, 0), Color(0.035, 0.04, 0.05))
    var light := OmniLight3D.new()
    light.position = pos + Vector3(0, 3.45, 0)
    light.omni_range = 7
    light.light_energy = 1.2
    light.light_color = Color(1.0, 0.78, 0.45)
    add_child(light)

func _box(n: String, size: Vector3, pos: Vector3, color: Color) -> void:
    var body := StaticBody3D.new()
    body.name = n
    body.position = pos
    var mesh := MeshInstance3D.new()
    var box := BoxMesh.new()
    box.size = size
    mesh.mesh = box
    var mat := StandardMaterial3D.new()
    mat.albedo_color = color
    mat.roughness = 0.78
    mesh.material_override = mat
    body.add_child(mesh)
    var collision := CollisionShape3D.new()
    var shape := BoxShape3D.new()
    shape.size = size
    collision.shape = shape
    body.add_child(collision)
    add_child(body)
