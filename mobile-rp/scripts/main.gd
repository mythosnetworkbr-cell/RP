extends Node

const WORLD_SCENE := preload("res://scenes/world.tscn")
var state: Node
var ui: Control

func _ready() -> void:
    state = preload("res://scripts/game_state.gd").new()
    state.name = "GameState"
    add_child(state)
    _show_menu()

func _clear() -> void:
    if ui:
        ui.queue_free()
    ui = Control.new()
    ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    add_child(ui)

func _show_menu() -> void:
    _clear()
    var bg := ColorRect.new()
    bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
    bg.color = Color(0.018, 0.025, 0.05)
    ui.add_child(bg)

    var glow := ColorRect.new()
    glow.position = Vector2(0, 0)
    glow.size = Vector2(1280, 9)
    glow.color = Color(0.40, 0.22, 0.95)
    ui.add_child(glow)

    var logo := Label.new()
    logo.text = "NYX"
    logo.position = Vector2(0, 105)
    logo.size = Vector2(1280, 95)
    logo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    logo.add_theme_font_size_override("font_size", 82)
    ui.add_child(logo)

    var sub := Label.new()
    sub.text = "ROLEPLAY  •  BRASIL"
    sub.position = Vector2(0, 195)
    sub.size = Vector2(1280, 45)
    sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    sub.add_theme_font_size_override("font_size", 20)
    ui.add_child(sub)

    var card := ColorRect.new()
    card.position = Vector2(390, 285)
    card.size = Vector2(500, 235)
    card.color = Color(0.05, 0.065, 0.11, 0.96)
    ui.add_child(card)

    var title := Label.new()
    title.text = "ENTRAR NA CIDADE"
    title.position = Vector2(30, 25)
    title.size = Vector2(440, 40)
    title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    title.add_theme_font_size_override("font_size", 22)
    card.add_child(title)

    var name := LineEdit.new()
    name.name = "Name"
    name.placeholder_text = "Nome do personagem"
    name.position = Vector2(45, 82)
    name.size = Vector2(410, 52)
    card.add_child(name)

    var play := Button.new()
    play.text = "JOGAR"
    play.position = Vector2(45, 150)
    play.size = Vector2(410, 58)
    play.add_theme_font_size_override("font_size", 20)
    play.pressed.connect(func():
        var clean := name.text.strip_edges()
        state.character_name = clean if not clean.is_empty() else "Cidadão"
        _start_world()
    )
    card.add_child(play)

    var footer := Label.new()
    footer.text = "MYTHØS NETWORK  •  NYX MOBILE"
    footer.position = Vector2(0, 650)
    footer.size = Vector2(1280, 30)
    footer.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    footer.add_theme_font_size_override("font_size", 12)
    ui.add_child(footer)

func _start_world() -> void:
    _clear()
    var world := WORLD_SCENE.instantiate()
    world.name = "World"
    world.state = state
    add_child(world)
    ui.queue_free()
    ui = null
