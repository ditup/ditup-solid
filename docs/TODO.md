# TODO

Here, we collect things we want to do, but don't want to do them now

_dit_ here means one of Idea, Project, Problem, Event, ... i.e. something to figure out, share, or do together

## Roadmap Overview

- [x] Sign in
- [x] CRD interests of self
- [x] CRUD my basic items (Ideas, Problems)
- [ ] Make more basic items (Projects, Events, Groups/Teams, Questions, Things I want to learn ...)
- [x] Make a dummy readonly index
- [x] Setup a dummy readonly index online
- [x] Show indexed items of other people
- [x] Show other people with my interests
- [x] Make & use index that accepts suggestions for indexing
- [x] Index authenticates people, allows users to remove themselves and their items from the index...
  - [ ] Index also updates itself regularly
- [ ] See details of items - comment, like, remember
- [ ] Connect with people - write to humans
- [ ] Make it nice looking (get design from somebody, and implement it!)
- [ ] Advertise within the Solid community and outside

## Ideas (Someday/Maybe)

- geo index: People and items have location which is taken into account when suggesting stuff
- propose interests to a person, similar to their interests and their items
- Unbubble - suggest the most dissimilar interests to the person
- Support for all languages
- Seamlessly incorporate DBpedia interests through their owl:sameAs tag to wikidata
- Create and manage a network of physical bases open for public. Something between of Library, Workshop, and Unschooling school for diverse people of all ages <3, especially lower 90%
- Make a mindmap of person's questions, issues, ideas; linked to other people's questions, issues, ideas
- can we connect all the person's knowledge? Books, ideas of others, citations, ... anything that has tags to wikidata or other things? Yeah, that's powerful.
- better matching algorithm - based on clusters of terms - so similar tags to each other will also help discover dits (suggested by @agatatalitatest)
- add interest to myself from interest list (feature requested by @agatatalitatest)

## Smaller tasks

- [ ] Figure out a proper vocabulary
- [x] Add creator to Dit Thing
- [ ] Use Comunica streaming with rtk-query (so things show up faster)
- [ ] 404 page
- [ ] A filter on Dit List
  - filter by dit type
  - filter by tags
  - sort by different kinds of relevance, creation, likes, ...
- [ ] add footer with link to Solid, github repository, attributions of fonts etc...
- [x] Add license
- [ ] Edit person's name, and about, and photo
- [x] Allow people to add themselves and their items from the index from within the app - show which items are public and which not
  - [ ] also allow removing self and items from index
- [ ] cache user images, so they don't load every time
- [x] list dits related to a tag (mine and other people's) on tag page
  - [ ] also list my dits
- [x] list person's dits on person page
- [ ] private dits (public, unlisted, private)
- [ ] rename Problems to Challenges
- [ ] edit only my own things
- [x] add interest to myself from interest page
- [ ] make weighted tag list (where tags have weight, some match the context more and some less)
- [ ] \(bug) fix stuck loading indicators when list is empty
- [ ] more secure delete (not one click)
- [ ] check if delete updates index accordingly (it probably doesn't)

### Styling

- [x] Set up and use icons with fontello
- [ ] Style tag lists and tags (readonly, and editable lists)
- [ ] Style tag page
- [ ] Style dit list and item
- [ ] Style dit form
- [ ] Style list with people
