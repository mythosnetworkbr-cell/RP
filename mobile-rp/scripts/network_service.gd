extends Node

const PORT := 7777
const MAX_PLAYERS := 100

var peer: ENetMultiplayerPeer

func host() -> Error:
    peer = ENetMultiplayerPeer.new()
    var result := peer.create_server(PORT, MAX_PLAYERS)
    if result == OK:
        multiplayer.multiplayer_peer = peer
    return result

func connect_to_server(address: String) -> Error:
    peer = ENetMultiplayerPeer.new()
    var result := peer.create_client(address, PORT)
    if result == OK:
        multiplayer.multiplayer_peer = peer
    return result
