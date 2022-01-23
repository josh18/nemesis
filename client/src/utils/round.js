export default function round(number, precision) {
    return +(Math.round(number + 'e+' + precision) + 'e-' + precision);
}
