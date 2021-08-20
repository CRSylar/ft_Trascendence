enum ERelation {
	admin,
	moderator,
	banned,
	muted
}

export class CacheSuperfast {
	private static owners : Map<string, boolean> = new Map<string, boolean>();
	private static relationUserChat : Map<string, Map<number, ERelation>> = new Map<string, Map<number, ERelation>>()
	private static userParticipant : Map<string, Map<number, boolean>> = new Map<string, Map<number, boolean>>();

	static isOwner(idIntra : string) {
		return CacheSuperfast.owners.has(idIntra)
	}

	static isAdmin(idIntra : string, idChat : number) {
		if (CacheSuperfast.relationUserChat.has(idIntra) && CacheSuperfast.relationUserChat.get(idIntra).has(idChat))
			return CacheSuperfast.relationUserChat.get(idIntra).get(idChat) === ERelation.admin || CacheSuperfast.isOwner(idIntra)
		return false
	}

	static isModerator(idIntra : string, idChat : number) {
		if (CacheSuperfast.relationUserChat.has(idIntra) && CacheSuperfast.relationUserChat.get(idIntra).has(idChat))
			return CacheSuperfast.relationUserChat.get(idIntra).get(idChat) === ERelation.moderator ||
			CacheSuperfast.isAdmin(idIntra, idChat) || CacheSuperfast.isOwner(idIntra)
		return false
	}

	static isBanned(idIntra : string, idChat : number) {

	}
}