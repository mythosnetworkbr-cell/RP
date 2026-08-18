extends Node

var character_name := "Cidadão"
var gender := "Não definido"
var cash := 0
var bank := 0
var nxcoin := 0
var job := "delivery"
var organization := ""
var admin_level := 0

func change_name(new_name: String) -> bool:
    var clean := new_name.strip_edges()
    if clean.is_empty() or nxcoin < 50:
        return false
    character_name = clean
    nxcoin -= 50
    return true

func deposit(amount: int) -> bool:
    if amount <= 0 or cash < amount:
        return false
    cash -= amount
    bank += amount
    return true

func withdraw(amount: int) -> bool:
    if amount <= 0 or bank < amount:
        return false
    bank -= amount
    cash += amount
    return true
