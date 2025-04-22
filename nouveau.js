import { Selector } from 'testcafe';

fixture`Test de connexion`
    .page`http://localhost:99/`;  // L'URL de la page de connexion

test('Connexion avec des identifiants valides, recherche de médicaments, ajout à l\'inventaire et test API', async t => {
    // Sélectionner les éléments du formulaire
    const emailField = Selector('#username');  // Champ email
    const passwordField = Selector('#password');  // Champ mot de passe
    const submitButton = Selector('button[type="submit"]');  // Bouton de soumission
    const errorMessage = Selector('.alert-danger');  // Message d'erreur (si présent)

    // Remplir le formulaire avec les identifiants fournis
    await t
        .typeText(emailField, 'test@test.com')
        .typeText(passwordField, 'test')
        .click(submitButton);

    // Vérifier qu'il n'y a pas de message d'erreur (si l'identifiant ou le mot de passe sont incorrects)
    await t.expect(errorMessage.exists).notOk();

    // Vérifier qu'on est redirigé vers la page d'accueil
    const currentUrl = await t.eval(() => window.location.href);  // Récupérer l'URL actuelle
    await t.expect(currentUrl).contains('/home');  // Vérifie que l'URL contient '/home'

    // Cliquer sur "Liste Médicaments" dans la navbar
    const listeMedicamentsLink = Selector('a').withText('Liste Médicaments');
    await t.click(listeMedicamentsLink);

    // Vérifier que la page "Liste Médicaments" est chargée
    await t.expect(Selector('h1').withText('Liste des médicaments').exists).ok();

    // Remplir le champ de recherche avec "dafalgan 1000" et soumettre
    const searchField = Selector('input[type="search"]');
    const searchButton = Selector('button[type="submit"]');
    await t
        .typeText(searchField, 'dafalgan 1000')
        .click(searchButton);

    // Vérifier que 3 résultats sont retournés
    const resultRows = Selector('#medicaments-table tbody tr');
    await t.expect(resultRows.count).eql(3);

    // Ajouter uniquement le Dafalgan 1000 à l'inventaire via le modal
    const dafalganRow = resultRows.filter(row => row.innerText.includes('DAFALGAN 1000 mg, comprimé pelliculé'));
    const dafalganAddButton = dafalganRow.find('.btn-success');
    await t.click(dafalganAddButton);

    const modal = Selector('.modal-content'); // plus spécifique à ton HTML
    const typeAjoutSelect = modal.find('#typeAjout-3881');
    const quantityInput = modal.find('#quantitePillules-3881');
    const submitModalButton = Selector('button.btn.btn-primary').withText('Ajouter à l\'inventaire');

    await t
        .click(typeAjoutSelect)
        .click(typeAjoutSelect.find('option').withAttribute('value', 'boite_entamee'))
        .expect(quantityInput.visible).ok()
        .typeText(quantityInput, '10')
        .pressKey('enter');


    // Rechercher le Doliprane avec son code CIP13
    const cip13Code = '3400936239258';
    const searchFieldCip = Selector('input[type="search"]');
    const resultRowsCip = Selector('.result-row'); // à adapter selon ta structure HTML
    const dolipraneAddButton = resultRowsCip.find('.btn-success');

    // Taper le code CIP13 et valider avec Enter
    await t
        .typeText(searchFieldCip, cip13Code, { replace: true })
        .pressKey('enter');

    // Vérifier qu’un seul résultat s’affiche
    await t.expect(resultRowsCip.count).eql(1);

    // Cliquer sur le bouton pour ajouter à l’inventaire
    await t.click(dolipraneAddButton);

    // Travailler avec le modal
    const modalCip = Selector('.modal-content');
    const typeAjoutSelectCip = modalCip.find('select[id^="typeAjout"]'); // correspond à id="typeAjout-XXXX"
    const boitesPleinesInput = modalCip.find('input[id^="nbBoitesPleines"]');

    // Choisir "Boîtes pleines" dans le select
    await t
        .click(typeAjoutSelectCip)
        .click(typeAjoutSelectCip.find('option').withAttribute('value', 'boites_pleines'));

    // Remplir la quantité et soumettre avec Enter
    await t
        .expect(boitesPleinesInput.visible).ok()
        .typeText(boitesPleinesInput, '5')
        .pressKey('enter'); // soumission du formulaire


    // Cliquer sur "Inventaire" dans la navbar
    const inventaireLink = Selector('a').withText('Inventaire');
    await t.click(inventaireLink);

    // Vérifier que la page "Inventaire" est chargée
    await t.expect(Selector('h1').withText('Inventaire').exists).ok();

    // Vérifier que Dafalgan et Doliprane sont dans l'inventaire
    const inventaireRows = Selector('.table tbody tr');
    await t.expect(inventaireRows.count).eql(2);

    // Retirer 5 unités de Dafalgan
    const dafalganInventaireRow = inventaireRows.filter(row => row.innerText.includes('DAFALGAN 1000 mg, comprimé pelliculé'));
    const dafalganConsumeButton = dafalganInventaireRow.find('.btn-primary');
    await t.click(dafalganConsumeButton);

    // Attendre que le modal soit visible
    await t.expect(modal.visible).ok({ timeout: 10000 });

    // Interagir avec le modal pour consommer Dafalgan
    const consumeQuantityInput = modal.find('input[name="quantite_consommee"]');
    await t
        .expect(consumeQuantityInput.exists).ok()  // Vérifier que l'input existe
        .typeText(consumeQuantityInput, '5')  // Indiquer la quantité à consommer
        .click(submitModalButton);

    // Ajouter 10 unités de Bisoprolol
    const bisoprololInventaireRow = inventaireRows.filter(row => row.innerText.includes('BISOPROLOL CRISTERS PHARMA 10 mg, comprimé pelliculé'));
    const bisoprololAddButton = bisoprololInventaireRow.find('.btn-primary');
    await t.click(bisoprololAddButton);

    // Attendre que le modal soit visible
    await t.expect(modal.visible).ok({ timeout: 10000 });

    // Interagir avec le modal pour ajouter Bisoprolol
    const addQuantityInput = modal.find('input[name="quantite_ajoutee"]');
    const submitModalButtonAjout = modal.find('button[type="submit"]').withText('Ajouter');


    await t
        .expect(addQuantityInput.exists).ok()  // Vérifier que l'input existe
        .typeText(addQuantityInput, '10')  // Indiquer la quantité
        .click(submitModalButtonAjout);

    // Vérifier que les quantités ont été mises à jour correctement
    await t.expect(dafalganInventaireRow.find('td').withText(/^[5-9]$|^[1-9][0-9]+$/).exists).ok();
    await t.expect(bisoprololInventaireRow.find('td').withText(/^(1[5-9]|[2-9][0-9]+)$/).exists).ok();

});

test('Vérifier le message d\'erreur avec des identifiants invalides', async t => {
    // Sélectionner les éléments du formulaire
    const emailField = Selector('#username');
    const passwordField = Selector('#password');
    const submitButton = Selector('button[type="submit"]');
    const errorMessage = Selector('.alert-danger');

    // Remplir le formulaire avec des identifiants incorrects
    await t
        .typeText(emailField, 'incorrect@test.com')
        .typeText(passwordField, 'wrongpass')
        .click(submitButton);

    // Vérifier que le message d'erreur apparaît
    await t.expect(errorMessage.exists).ok();
});

