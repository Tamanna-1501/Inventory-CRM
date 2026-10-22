export default function cx(...values) {
  return values.flat(Infinity).filter((value) => typeof value === 'string' && value.length > 0).join(' ');
}
