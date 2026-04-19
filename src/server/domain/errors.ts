export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class UnauthorizedError extends DomainError {
  constructor() {
    super("UNAUTHORIZED", "認証が必要です");
  }
}

export class ForbiddenError extends DomainError {
  constructor() {
    super("FORBIDDEN", "この操作は許可されていません");
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super("NOT_FOUND", `${resource} が見つかりません`);
  }
}

export class ValidationError extends DomainError {
  constructor(public readonly issues: { field: string; message: string }[]) {
    super("VALIDATION_ERROR", "バリデーションエラー");
  }
}

export class BusinessRuleError extends DomainError {}
