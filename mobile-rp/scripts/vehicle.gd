extends CharacterBody3D

var speed := 0.0
var engine_on := false
var fuel := 100.0
var health := 100.0

func _ready() -> void:
    _collision()
    _visual()

func _physics_process(delta: float) -> void:
    if engine_on:
        speed = move_toward(speed, 8.0, delta * 4.0)
        velocity.z = -speed
        fuel = maxf(0.0, fuel - delta * 0.4)
    else:
        speed = move_toward(speed, 0.0, delta * 8.0)
        velocity = Vector3.ZERO
    move_and_slide()

func toggle_engine() -> void:
    if fuel > 0.0 and health > 0.0:
        engine_on = not engine_on

func _collision() -> void:
    var c := CollisionShape3D.new()
    var s := BoxShape3D.new()
    s.size = Vector3(1.8, 0.8, 3.6)
    c.shape = s
    c.position.y = 0.55
    add_child(c)

func _visual() -> void:
    var body := MeshInstance3D.new()
    var bm := BoxMesh.new()
    bm.size = Vector3(1.8, 0.65, 3.6)
    body.mesh = bm
    body.position.y = 0.55
    body.material_override = _mat(Color(0.12, 0.22, 0.55))
    add_child(body)

    var roof := MeshInstance3D.new()
    var rm := BoxMesh.new()
    rm.size = Vector3(1.45, 0.45, 1.7)
    roof.mesh = rm
    roof.position = Vector3(0, 1.05, 0.05)
    roof.material_override = _mat(Color(0.06, 0.08, 0.12))
    add_child(roof)

    for x in [-0.75, 0.75]:
        for z in [-1.25, 1.25]:
            var wheel := MeshInstance3D.new()
            var wm := CylinderMesh.new()
            wm.top_radius = 0.32
            wm.bottom_radius = 0.32
            wm.height = 0.18
            wheel.mesh = wm
            wheel.rotation_degrees = Vector3(0, 0, 90)
            wheel.position = Vector3(x, 0.30, z)
            wheel.material_override = _mat(Color(0.015, 0.015, 0.018))
            add_child(wheel)

func _mat(c: Color) -> StandardMaterial3D:
    var m := StandardMaterial3D.new()
    m.albedo_color = c
    return m
