const fragment = `
#define PI 3.14159265
uniform vec3 uColor;
uniform vec3 uColor2;

varying vec2 vUv;

void main()
{
	float strength = vUv.y;

	float y = step(0.2, abs(sin(vUv.y * 40.0)));

	vec3 color = mix(uColor2, uColor, strength);

	gl_FragColor = vec4(color , y);
}
`

export default fragment