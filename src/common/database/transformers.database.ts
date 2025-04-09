export class DecimalTransformer {
  to(data: number): number {
    return +data || 0;
  }
  from(data: string): number {
    return +data || 0;
  }
}
