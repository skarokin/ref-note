package types

type ChangeDisplayNameReq struct {
	Username string `json:"username"`
	NewDisplayName string `json:"newDisplayName"`
}

type UpdateNoteReq struct {
	ClassID string `json:"classID"`
	NoteName string `json:"noteName"`
	NewNoteContent string `json:"newNoteContent"`
}