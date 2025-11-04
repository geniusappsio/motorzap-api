import type { Result } from './result';

export abstract class BaseEntity<Props> {
  protected readonly props: Props;
  protected readonly id: string;

  constructor(props: Props, id: string) {
    this.props = props;
    this.id = id;
  }

  getId(): string {
    return this.id;
  }

  getProps(): Props {
    return this.props;
  }

  equals(other: BaseEntity<Props>): boolean {
    if (!other) return false;
    return this.id === other.id;
  }

  abstract validate(): Result<void>;
}
