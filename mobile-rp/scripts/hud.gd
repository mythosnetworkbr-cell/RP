extends CanvasLayer

var player: CharacterBody3D
var state: Node
var vehicle: Node
var info: Label
var minimap: ColorRect
var vehicle_button: Button

func _ready() -> void:
    var top := ColorRect.new()
    top.position = Vector2(18, 18)
    top.size = Vector2(430, 105)
    top.color = Color(0.015, 0.02, 0.04, 0.88)
    add_child(top)

    var title := Label.new()
    title.position = Vector2(18, 9)
    title.text = "NYX ROLEPLAY"
    title.add_theme_font_size_override("font_size", 28)
    top.add_child(title)

    info = Label.new()
    info.position = Vector2(18, 50)
    info.add_theme_font_size_override("font_size", 15)
    top.add_child(info)

    minimap = ColorRect.new()
    minimap.position = Vector2(1060, 22)
    minimap.size = Vector2(185, 185)
    minimap.color = Color(0.025, 0.04, 0.06, 0.92)
    add_child(minimap)

    var map_title := Label.new()
    map_title.text = "MAPA"
    map_title.position = Vector2(12, 8)
    minimap.add_child(map_title)

    var dot := ColorRect.new()
    dot.position = Vector2(87, 87)
    dot.size = Vector2(10, 10)
    dot.color = Color(0.55, 0.3, 1.0)
    minimap.add_child(dot)

    _button("◀", Vector2(28, 515), func(): _move(Vector2(-1, 0)))
    _button("▶", Vector2(188, 515), func(): _move(Vector2(1, 0)))
    _button("▲", Vector2(108, 435), func(): _move(Vector2(0, -1)))
    _button("▼", Vector2(108, 595), func(): _move(Vector2(0, 1)))

    var sprint := Button.new()
    sprint.text = "CORRER"
    sprint.position = Vector2(1055, 540)
    sprint.size = Vector2(170, 62)
    add_child(sprint)
    sprint.button_down.connect(func(): player.touch_sprint = true)
    sprint.button_up.connect(func(): player.touch_sprint = false)

    var jump := Button.new()
    jump.text = "PULAR"
    jump.position = Vector2(1055, 465)
    jump.size = Vector2(170, 62)
    add_child(jump)
    jump.pressed.connect(func(): player.velocity.y = 6.0)

    vehicle_button = Button.new()
    vehicle_button.text = "CARRO"
    vehicle_button.position = Vector2(1055, 390)
    vehicle_button.size = Vector2(170, 62)
    add_child(vehicle_button)
    vehicle_button.pressed.connect(_toggle_vehicle)

    var phone := Button.new()
    phone.text = "CELULAR"
    phone.position = Vector2(880, 625)
    phone.size = Vector2(150, 55)
    add_child(phone)
    phone.pressed.connect(_phone)

func _process(_delta: float) -> void:
    if state and info:
        info.text = "Nome: %s   $%d   Banco: $%d   NXcoin: %d\n%s" % [
            state.character_name, state.cash, state.bank, state.nxcoin, "Cidade: Nyx"
        ]

func _button(text: String, pos: Vector2, action: Callable) -> void:
    var b := Button.new()
    b.text = text
    b.position = pos
    b.size = Vector2(72, 72)
    add_child(b)
    b.pressed.connect(action)

func _move(v: Vector2) -> void:
    if player:
        player.touch_move = v

func _toggle_vehicle() -> void:
    if vehicle and vehicle.has_method("toggle_engine"):
        vehicle.toggle_engine()

func _phone() -> void:
    var popup := AcceptDialog.new()
    popup.title = "Nyx Mobile"
    popup.dialog_text = "Celular Nyx\nContatos • Banco • Organizações • Atendimento"
    add_child(popup)
    popup.popup_centered()
