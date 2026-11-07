/**
 * Who runs the site: the data controller under KVKK and the service provider
 * under Law 6563. Shown on /privacy and /legal.
 *
 * Fill in `name` (real or company name) and `address` (a correspondence address).
 * Empty fields are hidden, so nothing placeholder-like ever reaches the page.
 */
export const OPERATOR = {
    name: 'Mehmet DEMİRKÖK',
    address: 'Çankaya / ANKARA',
    email: 'mehmetdemirkok@gmail.com',
    website: 'www.yulasanta.com.tr',
} as const;

/** True once the identity fields the law asks for are filled in. */
export const OPERATOR_COMPLETE = Boolean(OPERATOR.name && OPERATOR.address);
