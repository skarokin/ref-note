package types

type ChangeDisplayNameReq struct {
	Username string `json:"username"`
	NewDisplayName string `json:"newUsername"`
}