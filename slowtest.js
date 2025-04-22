import { Selector } from 'testcafe';

fixture`Test de connexion`
    .page`https://gim.faustbtl.site/`;  // L'URL de la page de connexion

test('Connexion avec des identifiants valides, recherche de médicaments, ajout à l\'inventaire et test API', async t => {
    await t.setTestSpeed(0.5); // Ralentit la vitesse d'exécution des tests à 50%

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

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Remplir le champ de recherche avec le code CIP13 du Doliprane 1000 et soumettre
    const cip13Code = '3400936239258';  // Code CIP13 pour Doliprane 1000
    await t
        .typeText(searchField, cip13Code, { replace: true })
        .click(searchButton);

    // Vérifier que les résultats attendus sont retournés (par exemple, 1 résultat)
    await t.expect(resultRows.count).eql(1);

    // Ajouter le Doliprane à l'inventaire via le modal
    const dolipraneAddButton = resultRows.find('.btn-success');
    await t.click(dolipraneAddButton);

    const nbBoitesPleines = modal.find('#nbBoitesPleines-2043');
    const quantitePleines = modal.find('#pillulesParBoite-2043');

    // Interagir avec le modal pour Doliprane
    await t
        .expect(nbBoitesPleines.exists).ok()  // Vérifier que l'input existe
        .expect(quantitePleines.exists).ok()  // Vérifier que l'input existe
        .typeText(nbBoitesPleines, '1')  // Indiquer la quantité
        .typeText(quantitePleines, '5')  // Indiquer la quantité
        .click(submitModalButton);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

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
    const submitModalButtonInventory = modal.find('button[type="submit"]');

    await t
        .expect(consumeQuantityInput.exists).ok()  // Vérifier que l'input existe
        .typeText(consumeQuantityInput, '5')  // Indiquer la quantité à consommer
        .click(submitModalButtonInventory);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Ajouter 10 unités de Bisoprolol
    const bisoprololInventaireRow = inventaireRows.filter(row => row.innerText.includes('BISOPROLOL CRISTERS PHARMA 10 mg, comprimé pelliculé'));
    const bisoprololAddButton = bisoprololInventaireRow.find('.btn-primary');
    // Cliquer sur le bouton "ajouter" pour Bisoprolol
    await t.click(bisoprololAddButton);

    // Redéfinir les éléments du nouveau modal après le clic
    const bisoprololModal = Selector('.modal-content').withText('BISOPROLOL');
    const addQuantityInput = bisoprololModal.find('input[name="quantite_ajoutee"]');
    const submitModalButtonAjout = bisoprololModal.find('button[type="submit"]').withText('Ajouter');

    // Interagir avec le bon modal
    await t
        .expect(addQuantityInput.exists).ok()
        .typeText(addQuantityInput, '10')
        .click(submitModalButtonAjout);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Vérifier que les quantités ont été mises à jour correctement
    await t.expect(dafalganInventaireRow.find('td').withText(/^[5-9]$|^[1-9][0-9]+$/).exists).ok();
    await t.expect(bisoprololInventaireRow.find('td').withText(/^(1[5-9]|[2-9][0-9]+)$/).exists).ok();

    // Cliquer sur "Traitement" dans la navbar
    const traitementLink = Selector('a').withText('Traitement');
    await t.click(traitementLink);

    // Vérifier que la page "Traitement" est chargée
    await t.expect(Selector('h1').withText('Mes Traitements').exists).ok();

    // Cliquer sur "Ajouter un nouveau traitement"
    const addTraitementButton = Selector('a').withText('Ajouter un nouveau traitement');
    await t.click(addTraitementButton);

    // Vérifier que la page "Ajouter un Traitement" est chargée
    await t.expect(Selector('h1').withText('Ajouter un Traitement').exists).ok();

    // Remplir le formulaire de traitement
    const nomTraitement = Selector('#traitement_nom');
    const dateRenouvellement = Selector('#traitement_dateRenouvellement');
    const dose = Selector('#traitement_dose');
    const frequenceJour = Selector('#traitement_frequence_0');
    const frequenceRenouvellement = Selector('#traitement_frequenceRenouvellement');
    const submitButtonTraitement = Selector('button[type="submit"]').withText('Ajouter');

    await t
        .typeText(nomTraitement, 'Traitement Test')
        .typeText(dateRenouvellement, '2025-12-31')
        .typeText(dose, '2')
        .click(frequenceJour)
        .typeText(frequenceRenouvellement, '30');

    // Soumettre le formulaire
    await t.click(submitButtonTraitement);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Vérifier que le traitement a été ajouté
    await t.expect(Selector('h1').withText('Mes Traitements').exists).ok();
    await t.expect(Selector('div').withText('Traitement Test').exists).ok();

    // Cliquer sur "Ajouter un médicament"
    const addMedicamentButton = Selector('a').withText('Ajouter un médicament');
    await t.click(addMedicamentButton);

    // Vérifier que la page "Ajouter un Médicament au Traitement" est chargée
    await t.expect(Selector('h1').withText('Ajouter un Médicament au Traitement : Traitement Test').exists).ok();

    // Sélectionner l'onglet "Mon Inventaire"
    const inventaireTab = Selector('a').withText('Mon Inventaire');
    await t.click(inventaireTab);

    // Sélectionner un médicament de l'inventaire (par exemple, Dafalgan)
    const dafalganCheckbox = Selector('#medicament_3881');
    await t.click(dafalganCheckbox);

    // Soumettre le formulaire pour ajouter le médicament au traitement
    const submitMedicamentButton = Selector('button').withText('Ajouter au traitement');
    await t.click(submitMedicamentButton);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Vérifier que le médicament a été ajouté au traitement
    await t.expect(Selector('div').withText('DAFALGAN 1000 mg, comprimé pelliculé').exists).ok();

    // Sélectionner l'onglet "Médicaments Globaux"
    const globalTab = Selector('a').withText('Médicaments Globaux');
    await t.click(globalTab);

    // Remplir le champ de recherche avec "paracetamol" et soumettre
    const searchFieldTraitement = Selector('input[type="search"]');
    const searchButtonTraitement = Selector('button[type="submit"]');
    await t
        .typeText(searchFieldTraitement, 'paracetamol')
        .click(searchButtonTraitement);

    // Sélectionner un médicament de la base (par exemple, Paracetamol)
    const paracetamolCheckbox = Selector('#medicament_10832'); // Remplacez par l'ID correct
    await t.click(paracetamolCheckbox);

    // Soumettre le formulaire pour ajouter le médicament au traitement
    await t.click(submitMedicamentButton);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Vérifier que le médicament a été ajouté au traitement
    await t.expect(Selector('div').withText('PARACETAMOL').exists).ok();

    // Retourner dans l'onglet "Traitement"
    await t.click(traitementLink);

    // Cliquer sur le bouton "Modifier"
    const modifyButton = Selector('button').withText('Modifier');
    await t.click(modifyButton);

    // Supprimer un médicament du traitement (par exemple, Dafalgan)
    const deleteMedicamentButton = Selector('.delete-medicament').withAttribute('data-medicament-id', '3881');
    await t.click(deleteMedicamentButton);

    // Attendre un peu pour voir l'action
    await t.wait(2000);

    // Vérifier que le médicament a été supprimé du traitement
    await t.expect(Selector('div').withText('DAFALGAN 1000 mg, comprimé pelliculé').exists).notOk();
});

test('Vérifier le message d\'erreur avec des identifiants invalides', async t => {
    await t.setTestSpeed(0.5); // Ralentit la vitesse d'exécution des tests à 50%

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
