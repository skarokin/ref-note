package types

type ChangeDisplayNameReq struct {
	Username string `json:"username"`
	NewDisplayName string `json:"newDisplayName"`
}

type XmlFragment struct {
    Type    string `json:"type"`
    Content string `json:"content"`
}

type DocumentStore struct {
    DocumentStore XmlFragment `json:"document-store"`
}

type UpdateNoteReq struct {
	ClassID string `json:"classID"`
	NoteName string `json:"noteName"`
	NewNoteContent string `json:"newNoteContent"`
}