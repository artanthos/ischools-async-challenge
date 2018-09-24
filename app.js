let $ = {
    /**
     * @param {string} uri
     */
    async fetchFrom(uri) {

        let answer = await fetch(_.endpoint(uri));

        // daca nu am status ok,
        // recursivitate, pana am raspuns
        
        if(answer.status > 200)
            return await $.fetchFrom(uri);

        let response = await answer.json();
        return response;
    },

    /**
     * @param {object} uriCollection
     * @returns {object}
     */
    async fetchAll(uriCollection){

        // fac un collector, ca sa pot sa rezolv toate promisiunile dintr-un foc
        // si sa colectez toate numerele necesare keys-urilor

        const arrayOfNumbers = await Promise.all(_.promisesCollector(uriCollection, [], $));
        
        // returnez un obiect
        // care contine:
        // 1. uriCollection 
            // { '0' : 
            //     {
            //         "key": ${k},
            //         'uri' : `getKey?key=${k}&stage=2`
            //     }
            // }
        // si 
        // 2. arrayOfNumbers, array-ul cu numere, fiecare numar corespunzator fiecarei chei
        // pentru a fi manipulate in pasul urmator

        return {uriCollection, arrayOfNumbers};
    },

    /**
     * @param {object} uriCollection
     */
    async fetchSingleKey(uri){
        // for some reason, nu vrea sa mearga cu fetch;
        // asa ca in loc sa folosesc metoda $.fetchFrom,
        // a trebuit sa folosesc un get de xhr -- definit in _.get(uri), utils.js
        // si sa returnez .responseText din obiectul rezultat;
        // nu am gasit nici o explicatie pentru asta;
        // weird :|
        let answer = await _.get(_.endpoint(uri));

        // daca nu am status ok,
        // recursivitate, pana am raspuns

        if(answer.status > 200)
            return await $.fetchSingleKey(uri);

        let response = await answer;
        return response.responseText;
    },

    /**
     * @param {string} uri
     */
    async searchForSuccess(uri){
        let answer = await $.fetchSingleKey(uri);

        // recursivitate, pana am success msg

        if(!answer.includes("Success:"))
            return await $.searchForSuccess(`getKey?key=${answer}&stage=4`);
           
        let response = await answer;
        return response;
    },
};

$.fetchFrom(`getKey`)
.then(keys => { _.writeToDOM(`Got keys for step 1. Now getting largest key...`); return _.getLargestFrom(keys); })
.then(answer => { _.writeToDOM(`Got largest key. Now starting step 2...`); return $.fetchFrom(`getKey?key=${answer}&stage=1`) })
.then(answer => { _.writeToDOM(`Manipulating...`); return _.reduceToObject(answer) })
.then(keysObject => { _.writeToDOM(`Step 3...`); return $.fetchAll(keysObject) })
.then(obj => { _.writeToDOM(`Manipulating...`); return _.assignNumbersToKeys(obj.uriCollection, obj.arrayOfNumbers, {}) })
.then(keys => { _.writeToDOM(`Getting largest key again...`); return _.getLargestFrom(keys) })
.then(key => { _.writeToDOM(`Step 4...`); return $.fetchSingleKey(`getKey?key=${key}&stage=3`) }) //stage=3
.then(key => { _.writeToDOM(`Searching for succes...`); return $.searchForSuccess(`getKey?key=${key}&stage=4`) }) //stage=4
.then(answer => _.writeToDOM(answer))



// .then(answer => console.log(answer))
