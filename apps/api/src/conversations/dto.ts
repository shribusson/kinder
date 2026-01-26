export interface SendMessageDto {
  accountId: string;
  text: string;
  mediaFileId?: string;
}

export interface MarkAsReadDto {
  accountId: string;
}

export interface AssignConversationDto {
  accountId: string;
  userId: string;
}

export interface GetConversationsQueryDto {
  accountId: string;
  channel?: string;
  search?: string;
  unreadOnly?: string;
  assignedToUserId?: string;
  page?: string;
  limit?: string;
}

export interface ArchiveConversationDto {
  accountId: string;
}
