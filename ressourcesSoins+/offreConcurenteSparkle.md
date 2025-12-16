SOINS+ : Plateforme Intégrée pour Prestataires de
Soins Indépendants
Document........................................................................................................................................
1.1. Historique d’édition du document
Version Date Auteur Commentaire
1.0 06 /0 6 /2025 Frédéric Carbonnelle Spécifications
1.1 10 /0 6 /2025 Renaud Dumont Budget
1.2. Destinataires
● Benoît Carbonnelle

Ce document est adapté à votre projet et reflète l’analyse fonctionnelle et technique qui en a été faite dans une phase préliminaire. Vous êtes libre
de le partager avec toute personne que vous jugez pertinente dans la mise en œuvre du projet.

1.3. Table des matières
1.3. Table des matières
Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 2 /
Document........................................................................................................................................
- 1.1. Historique d’édition du document
- 1.2. Destinataires
- 1.3. Table des matières
Présentation de Sparkle
Introduction
- 1.4. Contexte
- 1.4.1. Objectif
Solution
- 1.5. Design
- 1.6. Choix technologique
- 1.6.1. Applications web
- 1.6.2. Serveurs et hébergement cloud
- 1.6.3. Gestion des payements...........................................................................................
- 1.7. Périmètre fonctionnel
- 1.7.1. Plateforme utilisateur
- 1.7.2. Plateforme administrateur
- 1.7.3. Outils de monitoring
- 1.8. Coûts de l’infrastructure
Budget
Délais et validité de l’offre
Paiement
Garantie
Contact
Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 3 / 13
Présentation de Sparkle
Grâce à cette combinaison d’expertise, de vision stratégique et de culture centrée sur le client,
Sparkle est le partenaire idéal pour développer des solutions qui répondent aux défis complexes
de ses clients tout en anticipant leurs futurs besoins.

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 4 / 13
Introduction
1.4. Contexte
1.4.1. Objectif
SOINS+ sera la première plateforme tout-en-un dédiée aux prestataires de soins indépendants
en Belgique, leur permettant de maximiser leur temps auprès des patients en réduisant
drastiquement la charge administrative, tout en assurant leur développement professionnel
continu.

Les prestataires de soins indépendants font face à plusieurs défis majeurs :

Une charge administrative croissante qui réduit le temps consacré aux soins.
Des exigences de formation continue pour maintenir leurs compétences à jour.
SOLUTION
Un besoin de soutien juridique face à des situations médico-sociales complexes.
Un manque d'outils digitalisés pour simplifier la gestion quotidienne.
SOINS+ souhaite intégrer plusieurs modules complémentaires sur une plateforme unique visant
à réduire la charge administrative et à améliorer la formation et l'accompagnement des
soignants.

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 5 / 13
Solution
1.5. Design
Une proposition de design est fournie par Sparkle en complément de ce document. Les coûts de
réalisation de ce design sont offerts en cas d’acceptation de l’offre. Ce design est évolutif et
pourra faire l’objet de légères modifications en amont du développement sans surcoût
(agencement des éléments, images, logo, navigation et couleurs).

Le client peut décider d’utiliser ce design ou bien d’en commander un nouveau ce qui impliquera
une mise à jour de l’offre.

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 6 / 13
1.6. Choix technologique
1.6.1. Applications web
Le développement de l'application web sera effectué en utilisant React. Ce framework JavaScript
est réputé pour ses performances, sa flexibilité et sa capacité à créer des interfaces utilisateur
dynamiques et réactives. Il simplifie la gestion des composants et garantit une expérience
utilisateur fluide sur divers appareils, faisant ainsi de lui un choix idéal pour une application web
responsive.

Le backend sera développé avec un framework javascript moderne, adapté au cloud et prévu
pour l’optimisation des ressources et du temps de réponse.

1.6.2. Serveurs et hébergement cloud
Les comptes de services d’hébergements ( Microsoft Azure ou Vercel ) seront pris par le client et
l’accès délégué à l’équipe de Sparkle pour permettre la configuration, la mise en œuvre et la
maintenance du projet SOINS+.

Les services d’hébergement sont donc entièrement à la charge du client.

1.6.3. Gestion des payements...........................................................................................
Pour la gestion des paiements, l'intégration de Stripe permettra une solution robuste et efficace.
Ce choix garantit une expérience fluide pour les utilisateurs grâce à des processus sécurisés et
intuitifs, qu'il s'agisse de régler des frais ou de suivre leurs transactions. En parallèle,
l'administrateur bénéficiera d'outils de gestion avancés pour superviser les paiements, accéder à
des rapports détaillés et effectuer des configurations adaptées aux besoins spécifiques,
simplifiant ainsi la charge administrative tout en assurant la transparence et la fiabilité du
système.

1.7. Périmètre fonctionnel
Le périmètre défini ci-dessous a été choisi pour correspondre au mieux à la vision de SOINS+ :
pas qu’un outil de formation, une plateforme tout en un, amenée à évoluer. L’offre se base sur
l’ensemble de ces fonctionnalités. Le montant de l’offre peut donc être adapté en diminuant ou
en augmentant ce périmètre.

Deux outils seront développés : la plateforme à destination de utilisateurs finaux et la plateforme
de gestion destinées aux administrateurs de SOINS+.

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 7 / 13
Les deux plateformes seront optimisées pour un affichage « bureau » mais un soin tout
particulier sera mis sur l’affichage en mode mobile de la plateforme utilisateur.

1.7.1. Plateforme utilisateur
La plateforme utilisateur fournira une première version entièrement utilisable par les
prestataires de SOINS+ en se concentrant exclusivement sur trois modules.

Le module de formation qui répondra aux besoins suivants :

Offrir un accès facile à des formations variées (vidéos, présentiel, distanciel).
Faciliter l’inscription et le suivi des formations par les utilisateurs.
Offrir un lecteur vidéo agréable pour le suivi des parcours vidéo.
Automatiser la gestion des attestations de formation.
Fournir des outils de suivi et de gestion pour les administrateurs.
Le module juridique qui répondra aux besoins suivants :

Communiquer des informations utiles de première ligne sous forme de FAQ
Fournir un formulaire de prise de rendez-vous avec un expert juriste
Le module « Tableau de bord » plus transverse qui répondra aux besoins suivants :

Affichage de l’actualité de l’utilisateur (formation en cours, à venir,...)
Affichage d’actualités du secteur et de SOINS+ (articles, news,...)
1.7.2. Plateforme administrateur
La plateforme Administrateur permettra de répondre à tous les besoins de gestion des modules
pré-cités :

Gestion des formations (création, suppression édition)
Gestion des formateurs (création, suppression, édition)
Gestion des participants aux formations (consultation, marquage comme présent)
Génération automatique des attestations
Gestion du contenu de la Faq juridique
Gestion du contenu des articles / news
1.7.3. Outils de monitoring
Pour garantir la haute disponibilité de l’application et comprendre les habitudes des utilisateurs,
deux outils de monitoring seront intégrés : Sentry et Microsoft Clarity.

Sentry jouera un rôle clé dans la détection et la gestion des dysfonctionnements. Cet outil permet
de surveiller en temps réel les erreurs et les performances de l’application. En identifiant

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 8 / 13
rapidement les problèmes, il offre la possibilité d’agir proactivement pour minimiser les
perturbations et garantir une expérience utilisateur fluide. Son utilisation permet non seulement
de réduire les temps d’arrêt, mais aussi d’apporter rapidement des correctifs, améliorant ainsi la
crédibilité et la fiabilité du logiciel.

Microsoft Clarity , quant à lui, est un outil de
monitoring des usages qui analyse la manière
dont les utilisateurs interagissent avec
l’application. Grâce à des données visuelles et
comportementales, il offre une compréhension
approfondie des parcours utilisateurs, des zones
de friction et des fonctionnalités les plus utilisées.
Ces informations précieuses sont essentielles
pour orienter l’évolution et l’amélioration
continue de l’application. En mettant en lumière
les besoins réels des utilisateurs, Clarity aide à
prioriser les développements et à créer une
interface plus intuitive et efficace.

En combinant ces deux outils, le logiciel bénéficie d’une double assurance : un fonctionnement
technique optimal et une adaptation constante aux attentes des utilisateurs. Cela représente une
valeur ajoutée majeure, garantissant une satisfaction accrue et une fidélisation des utilisateurs
tout en renforçant la compétitivité du produit sur le marché.

1.8. Coûts de l’infrastructure
La gestion des différents types de contenus, l’envoi de mails, et d’autres fonctionnalités
nécessitent la mise en place d’un service web, d’une base de données, et de l’intégration d’un
service d’envoi d’emails.

Nous recommandons l’utilisation d’un cloud (hébergement) et de Postmark (envoi d’emails).

Les comptes de services doivent appartenir au client qui peut nous déléguer la gestion en nous
fournissant les droits d’accès suffisants.

Estimation de coûts :

Coût de l’infrastructure estimée sur par environnement : 50 € / mois

Services web
Stockages
Base de données
Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 9 / 13
Coût approximatif de Postmark.app (ou similaire) : 20 € / mois

Dans le cadre de notre collaboration, Sparkle prend en charge les postes suivants :

Mise à disposition d’un service d’hébergement de code source.
GitHub Enterprise
Mise à disposition d’un service de gestion de projet avec backlog et suivi des bugs.
GitHub Enterprise
Mise à disposition d’un pipeline de déploiement continu pour les applications web.
GitHub Enterprise
Budget
Design UX/UI et prototype

Une proposition graphique originale sera proposée au client dans le cadre de cette offre.

Objet Valeur
Forfait UX – Prototype fonctionnel - Forfait 3 jours 3. 000 ,00 €
En cas d’acceptation de l’offre et du design en l’état, ce poste est offert.

Développement : web

Ce tableau résume le budget par module. Plus de détails peuvent être consultés en annexe.

Total : 25. 056 € HTVA

Gestion de projet

Module Somme de Budget
Général et identification 2. 400 ,00 €
Gestion des abonnements et paiements en ligne 1. 536 ,00 €
Accès au catalogue de formations 6.432,00 €
Parcours de formations vidéo 3.312,00 €
Administration générale 1 .440,00 €
Administration des formations 7.632,00 €
Module juridique 1.152,00 €
Actualités 1.152,00 €
Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 10 / 13
Le projet pourra être découpé en 4 phases, avec à chaque étape une séance de démonstration
et de feedback.

Objet Montant
Gestion de projet, séances de travail – Forfait 3 jours (TJM 640 €) 1.920,00 €
Maintenance

Une application mobile, contrairement au web, impose une maintenance stricte et régulière.
Sans cette maintenance, les stores d’application mobile (Apple Store et Google Play) peuvent à
tout moment arrêter de distribuer les applications qui ne satisfont plus aux exigences.

Objet Montant
Maintenance : base de 5 jours / an 3. 200 €
La maintenance permet de couvrir :

La prise en charge et résolution de bugs
La mise à jour de dépendances
Le développement de nouvelles fonctionnalités
En cas de dépassement du budget-temps de 5 jours / an, les prestations supplémentaires seront
facturées à un tarif horaire de 80 € htva.

Récapitulatif

Objet Montant
Design UX/UI et prototype (valeur 3.00 0 €) Offert
Développement 25.056,00 €
Gestion de projet, séances de travail – Forfait 3 jours (TJM 64 0€) 1 .92 0 ,00 €
TOTAL : 26. 976 ,00 €
Délais et validité de l’offre
Nous estimons que l’effort nécessaire représente 40 jours de travail homme. En y ajoutant du
temps de gestion, des réunions, des étapes de validation et de test, nous estimons qu’il est
possible de livrer le projet en 3 mois à partir de la date de commande.

Les tarifs et délais présentés sont valables pour une durée de 3 mois à partir de la remise de
l’offre.

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 11 / 13
Paiement
Un acompte de 30% est facturé en début de mission. Aux deux tiers de la mission (backlog), 40%
supplémentaires seront facturés. Le solde sera facturé lors de la livraison.

Garantie
Sparkle s’engage à prendre à sa charge la résolution de tous bugs détectés dans les 60 jours
calendrier à partir de la date de livraison effective. Cette garantie couvre la correction de bugs
dans le chef de Sparkle ou liés à des dépendances ou services tiers utilisés par Sparkle.

Les changements fonctionnels ne sont pas couverts par la garantie et doivent faire l’objet d’une
nouvelle offre. Sparkle a toutefois une politique flexible en matière de modifications de
spécifications et souhaite apporter une satisfaction maximale à ses clients. Sparkle se réserve
donc le droit de prendre à sa charge le développement de certaines demandes qui lui semblent
pertinentes et raisonnables.

Contact
Pour toute question relative à ce document, contactez votre gestionnaire de projet :

Renaud Dumont | renaud@sparkle.tech | 0495 64 88 95

Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 12 / 13
Annexe 1 – Backlog
General & Identification Effort
Configuration de l'hébergement + dépôt de code + CI/CD et services tiers (email) 1
En tant qu'utilisateur, je souhaite qu'une page vitrine simple me présente l'outil SOINS+ 6
En tant qu'utilisateur, je souhaite me connecter de façon sécurisée via email et mot de passe 3
En tant qu'utilisateur, je souhaite récupérer mon mot de passe par email 3
En tant qu'utilisateur, je souhaite modifier mes informations personnelles et mot de passe 6
En tant qu'utilisateur, je souhaite uploader mon diplôme dans mon profil 6
Payement Effort
Configuration de l'environnement Stripe 6
En tant qu'utilisateur, je souhaite être invité à souscrire à un abonnement lors de mon
inscription 6
En tant qu'utilisateur, je souhaite mettre fin à mon abonnement 3
En tant qu'utilisateur, je souhaite être averti lors du renouvelement de mon abonnement 1
Accès au catalogue de formations Effort
Design général des écrans 12,
En tant qu'utilisateur, je souhaite consulter la liste des formations avec infos 12,
En tant qu'utilisateur, je souhaite rechercher et filtrer les formations 9
En tant qu'utilisateur, je souhaite pouvoir accéder au détail d’une formation (lieu, date, thème,
etc.) 6
En tant qu'utilisateur, je souhaite m’inscrire à une formation 6
En tant qu'utilisateur, je souhaite voir mes formations à venir 6
En tant qu'utilisateur, je souhaite recevoir des rappels avant mes formations 3
En tant qu'utilisateur, je souhaite consulter l’historique de mes formations et télécharger mes
attestations 6
En tant qu'utilisateur, je souhaite recevoir automatiquement mon attestation par email après
validation d'une formation 3
En tant qu'utilisateur, je souhaite consulters des statistiques générales sur mes formations
(Nbr en cours, terminée, à venir) 3
Parcours de formations vidéo Effort
En tant qu'utilisateur, je souhaite naviguer entre les chapitres d’un parcours vidéo 9
En tant qu'utilisateur, je souhaite visualiser les capsules vidéo par chapitre et disposer d'un
lecteur vidéo standard 12,
En tant qu'utilisateur, je souhaite voir ma progression dans le parcours 3
En tant qu'utilisateur, je souhaite répondre à un QCM à la fin du parcours 6
En tant qu'utilisateur, je souhaite que le QCM valide la formation selon un seuil configurable 3
Soins+ – Plateforme intégrée pour prestataires de soins indépendants p. 13 / 13

En tant qu'utilisateur, je souhaite que la formation soit marquée comme réussie
automatiquement 1
Administration générale Effort
En tant qu'administrateur, je souhaite pouvoir consulter la liste des utilisateurs inscrits sur la
plateforme 6
En tant qu'administrateur, je souhaite pouvoir activer manuellement un abonnement pour un
utilisateur 3
En tant qu'administrateur, je souhaite pouvoir supprimer un utilisateur 0
En tant qu'administrateur, je souhaite pouvoir gérer les formateurs (ajouter, supprimer et éditer
les informations) 6
Administration des formations Effort
En tant qu’administrateur, je souhaite créer une formation avec tous les champs requis 9
En tant qu’administrateur, je souhaite assigner un formateur à une formation 6
En tant qu’administrateur, je souhaite créer des chapitres et uploader des vidéos pour les
parcours de formations vidéos 12,
En tant qu'administrateur, je souhaite pouvoir créer et maintenir les QCM associés à chaque
parcours de formation 25
En tant qu’administrateur, je souhaite pouvoir consulter les participants d'une formation 6
En tant que formateur, je souhaite valider manuellement la présence des participants 3
En tant que formateur, je souhaite déclencher l’envoi d’une attestation après validation 6
Module juridique Effort
En tant qu'utilisateur, je veux pouvoir consulter une FAQ avec du contenu juridique 3
En tant qu'utilisateur, je souhaite pouvoir contacter SOINS+ via un formulaire pour des
questions juridiques 3
En tant qu'administrateur, je souhaite pouvoir gérer le contenu de la FAQ 6
Actualités Effort
En tant qu'utilisateur, je souhaite pouvoir voir la liste des actualités 3
En tant qu'utilisateur, je souhaite pouvoir consulter le détail d'une actualité 3
En tant qu'administrateur, je souhaite pouvoir ajouter une actualité avec un formatage simple 6