// The code contained in this file was sourced from Mozilla's now deprecated Page
// Metadata Parser project. The original authors of this code (in no particular order) 
// include:
//
//   - jaredlockhart (Jared Lockhart)
//   - pdehaan (Peter deHaan)
//   - farhanpatel (Farhan)
//   - jhugman
//   - k88hudson (Kate Hudson)
//   - pocmo (Sebastian Kaspari)
//
// Source: https://github.com/mozilla/page-metadata-parser
//
// The code was ported here, along with some modifications and general improvements,
// for the following reasons:
//
//  - The project is deprecated (unsupported) and the code might be unavailable in future.
//  - The project fails to build with modern versions of Node due to unsupported features.
//  - A reduction of external dependencies, leading to more manageable code audits.
//  - Better control over the parsing metadata from pages that is fit for purpose.

/**
 * The set of rules to apply when extracting metadata from documents. The ordering of 
 * the rules for each metadata item matters and signifies preference. The first rule 
 * is the most preferred way to extract data and the last rule is the least preferred.
 * 
 * If rules within a ruleset fails to match, a default function can be provided.
 * Additionaly, a set of post-processing steps can be specified on the metadata.
 */
const metadataRuleSets = {
    description: {
        rules: [
            ['meta[property="og:description"]', element => element.getAttribute('content')],
            ['meta[name="description" i]', element => element.getAttribute('content')],
        ],
    },
    image: {
        rules: [
            ['meta[property="og:image:secure_url"]', element => element.getAttribute('content')],
            ['meta[property="og:image:url"]', element => element.getAttribute('content')],
            ['meta[property="og:image"]', element => element.getAttribute('content')],
            ['meta[name="twitter:image"]', element => element.getAttribute('content')],
            ['meta[property="twitter:image"]', element => element.getAttribute('content')],
            ['meta[name="thumbnail"]', element => element.getAttribute('content')],
        ],
        processors: [
            (image_url, context) => new URL(image_url, context.url).toString()
        ],
    },
    keywords: {
        rules: [
            ['meta[name="keywords" i]', element => element.getAttribute('content')],
        ],
        processors: [
            (keywords, context) => keywords.split(',').map((keyword) => keyword.trim())
        ]
    },
    title: {
        rules: [
            ['meta[property="og:title"]', element => element.getAttribute('content')],
            ['meta[name="twitter:title"]', element => element.getAttribute('content')],
            ['meta[property="twitter:title"]', element => element.getAttribute('content')],
            ['meta[name="hdl"]', element => element.getAttribute('content')],
            ['title', element => element.text],
        ],
    },
    language: {
        rules: [
            ['html[lang]', element => element.getAttribute('lang')],
            ['meta[name="language" i]', element => element.getAttribute('content')],
        ],
        processors: [
            (language, context) => language.split('-')[0]
        ]
    },
    type: {
        rules: [
            ['meta[property="og:type"]', element => element.getAttribute('content')],
        ],
    },
    url: {
        rules: [],
        defaultValue: (context) => context.url,
    },
    provider: {
        rules: [
            ['meta[property="og:site_name"]', element => element.getAttribute('content')]
        ],
        defaultValue: (context) => getProvider(new URL(context.url).hostname)
    },
};

/**
 * Constructs a provider name from the hostname of the url.
 * @param {string} host The hostname from the url.
 * @returns {string} A suitable provider name.
 */
const getProvider = (host) => {
    return host
        .replace(/www[a-zA-Z0-9]*\./, '')
        .replace('.co.', '.')
        .split('.')
        .slice(0, -1)
        .join(' ');
}

/**
 * Applies the given set of rules in order to extract a metadata key. If no data is 
 * available the default function of the ruleset is called. Finally, a set of 
 * post-processing is done before the meta data is returned.
 * @param {Object} ruleSet The set of rules to apply to extract a metadata key.
 * @returns 
 */
const buildRuleSet = ruleSet => {
    return (doc, context) => {
        let data = null;

        // Apply rules in order of preference.
        ruleSet.rules.some((rule) => {
            const [query, handler] = rule;
            const element = doc.querySelector(query);
            if (element) {
                data = handler(element);
            }
            return data != null;
        });

        // If data is still empty then get default value if possible.
        if (!data && ruleSet.defaultValue) {
            data = ruleSet.defaultValue(context);
        }

        // Apply set of post-processors on the data for further modification.
        if (data) {
            if (ruleSet.processors) {
                ruleSet.processors.forEach((processor) => {
                    data = processor(data, context);
                });
            }
        }
        return data;
    }
}

/**
 * Extracts metadata from the given document by applying a set of rules.
 * @param {Object} doc The document from which to extract metadata.
 * @param {string} url The url of the document.
 * @returns {Object} A object containg a set of metadata keys and values.
 */
const getMetadata = (doc, url) => {
    const metadata = {};
    const context = {
        url,
    };

    Object.keys(metadataRuleSets).forEach(ruleSetKey => {
        const ruleSet = metadataRuleSets[ruleSetKey];
        const builtRuleSet = buildRuleSet(ruleSet);
        metadata[ruleSetKey] = builtRuleSet(doc, context);
    });

    return metadata;
}

export { getMetadata };
