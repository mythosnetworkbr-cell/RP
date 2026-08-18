extends CharacterBody3D

const WALK_SPEED := 4.5
const SPRINT_SPEED := 7.0
const JUMP := 6.0
const GRAVITY := 18.0

var touch_move := Vector2.ZERO
var touch_sprint := false
var camera: Camera3D
var anim_time := 0.0

func _ready() -> void:
    _collision()
    _visual()
    camera = Camera3D.new()
    camera.position = Vector3(0, 2.6, 6.2)
    camera.current = true
    camera.fov = 66
    add_child(camera)

func _physics_process(delta: float) -> void:
    anim_time += delta
    var v := Input.get_vector("ui_left", "ui_right", "ui_up", "ui_down")
    if touch_move.length() > 0.1:
        v = touch_move
    var direction := Vector3(v.x, 0, v.y)
    if direction.length() > 1.0:
        direction = direction.normalized()

    var speed := SPRINT_SPEED if touch_sprint else WALK_SPEED
    velocity.x = direction.x * speed
    velocity.z = direction.z * speed

    if not is_on_floor():
        velocity.y -= GRAVITY * delta
    elif Input.is_action_just_pressed("ui_accept"):
        velocity.y = JUMP

    if direction.length() > 0.1:
        rotation.y = lerp_angle(rotation.y, atan2(-direction.x, -direction.z), delta * 10.0)

    move_and_slide()

    if camera:
        camera.global_position = global_position + Vector3(0, 2.6, 6.2)
        camera.look_at(global_position + Vector3(0, 1.0, 0), Vector3.UP)

func _collision() -> void:
    var c := CollisionShape3D.new()
    var s := CapsuleShape3D.new()
    s.radius = 0.38
    s.height = 1.8
    c.shape = s
    c.position.y = 0.9
    add_child(c)

func _visual() -> void:
    var root := Node3D.new()
    root.name = "CharacterVisual"
    add_child(root)
    root.add_child(_capsule(0.42, 1.0, Vector3(0, 1.0, 0), Color(0.045, 0.09, 0.18)))
    root.add_child(_sphere(0.34, Vector3(0, 1.95, 0), Color(0.70, 0.45, 0.30)))
    root.add_child(_box(Vector3(0.25, 0.78, 0.25), Vector3(-0.18, 0.35, 0), Color(0.035, 0.04, 0.055)))
    root.add_child(_box(Vector3(0.25, 0.78, 0.25), Vector3(0.18, 0.35, 0), Color(0.035, 0.04, 0.055)))
    root.add_child(_box(Vector3(0.18, 0.82, 0.18), Vector3(-0.56, 1.0, 0), Color(0.045, 0.09, 0.18)))
    root.add_child(_box(Vector3(0.18, 0.82, 0.18), Vector3(0.56, 1.0, 0), Color(0.045, 0.09, 0.18)))

func _mat(c: Color) -> StandardMaterial3D:
    var m := StandardMaterial3D.new()
    m.albedo_color = c
    m.roughness = 0.72
    return m

func _box(s: Vector3, p: Vector3, c: Color) -> MeshInstance3D:
    var n := MeshInstance3D.new()
    n.position = p
    var m := BoxMesh.new()
    m.size = s
    n.mesh = m
    n.material_override = _mat(c)
    return n

func _sphere(r: float, p: Vector3, c: Color) -> MeshInstance3D:
    var n := MeshInstance3D.new()
    n.position = p
    var m := SphereMesh.new()
    m.radius = r
    m.height = r * 2.0
    n.mesh = m
    n.material_override = _mat(c)
    return n

func _capsule(r: float, h: float, p: Vector3, c: Color) -> MeshInstance3D:
    var n := MeshInstance3D.new()
    n.position = p
    var m := CapsuleMesh.new()
    m.radius = r
    m.height = h
    n.mesh = m
    n.material_override = _mat(c)
    return n
