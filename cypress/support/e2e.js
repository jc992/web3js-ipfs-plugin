import 'cypress-jest-adapter';

// Enable the hook to match Jest
global.beforeAll = global.before;
global.afterAll = global.after;

// In e2e tests we just need to use jest mocking API
global.jest = {
	fn: global.cy.stub,
	spyOn: global.cy.spy,
};

global.it = it;
global.test = it;
global.it.each = data => (describe, test) => {
	const prs = [];
	for (const d of data) {
		if (Array.isArray(d)) {
			prs.push(global.it(describe, test.bind(undefined, ...d)));
		} else {
			prs.push(global.it(describe, test.bind(undefined, d)));
		}
	}
	return Promise.all(prs);
};