let _ = {
    /**
     * @param {string} msg
     * @returns {string}
     */
    endpoint(uri) {

        // formateaza endpointurile,
        // astfel incat sa am nevoie doar de uri-uri

        return `https://intschools-javascript-test.firebaseapp.com/${uri}`
    },    

    /**
     * @param {object} keys
     */
    getLargestFrom(keys){

        // preia un obiect de forma
            // {
            //     "5nc0jmsuumihak0kqaakisv2h" : 12354
            //     "a6eg2f331t9bzgl9zof9pl8nf" : 67890
            // }
        // transforma in array
        // si ordoneaza descrescator

        return Object
            .keys(keys)
            .map( i => [i, keys[i]] )
            .sort( (a, b) => b[1] - a[1] )[0][0]
    },

    /**
     * @param {object} keys
     * @returns {object}
     */
    reduceToObject(keys){

        // fac un acumulator
        // care sa contina toate cheile
        // si uri-urile
        // pentru un Promise.all
        // si pe care sa-l completez ulterior
        // cu numarul corespunzator fiecarei chei

        let collReducer = (acc, k, ii) => {
                acc[ii] = {
                    'key': k,
                    'uri' : `getKey?key=${k}&stage=2`
                };
                return acc;
            };
    
        return keys.reduce(collReducer, {});
    },

    /**
     * @param {object} uriCollection
     * @param {array} accumulator
     * @param {object} $ Reference to the $ object
     * @returns {array}
     */
    promisesCollector(uriCollection, accumulator, $){
        
        // colector de promisuri pentru keys,
        // ca sa pot sa le execut pe toate
        // intr-un singur pas

        for (let key in uriCollection) {
            accumulator.push($.fetchFrom(uriCollection[key]["uri"]));
        };

        return accumulator;
    },

    /**
     * @param {object} uriCollection
     * @param {array} arrayOfNumbers
     * @param {object} accumulator
     * @returns {object}
     */
    assignNumbersToKeys(keysAndUrisObj, arrayOfNumbers, accumulator){
        
        // aici fac un obiect de forma 
            // {
            //     "5nc0jmsuumihak0kqaakisv2h" : 12364
            // }
        // asemanator cu obiectul de la pasul 1
        // ca sa pot refolosi _.getLargestFrom

        for(let ii = 0; ii < arrayOfNumbers.length; ii++){
            let key = keysAndUrisObj[ii]["key"],
                number = arrayOfNumbers[ii];

                accumulator[key] = number;
                delete(keysAndUrisObj[ii]); //chiar daca la propriu nu sterge alocarea de memorie, sa arate frumos la console.log :)
        }

        return accumulator;
    },
    
    /**
     * @param {string} msg
     */
    writeToDOM(msg){
        
        // scrie in DOM mesajul corespunzator fiecarui pas

        const   node = document.createElement("div"),
                textnode = document.createTextNode(msg);
        node.appendChild(textnode);
        document.getElementsByTagName('body')[0].appendChild(node);
    },

    /**
     * @param {string} url
     */
    get(url){

        // hack ieftin pentru ultimul pas        

        return _.xhr({
            "method":"GET",
            "url":url
        });
    },

    /**
     * @param {object} data
     */
    xhr(data){

        // returnez un promise de xhr;
        // hack ieftin pentru ultimul pas

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open(data.method, data.url);
            xhr.onload = () => resolve(xhr);
            xhr.onerror = () => reject(xhr.statusText);
            xhr.send();
        });
    }
};