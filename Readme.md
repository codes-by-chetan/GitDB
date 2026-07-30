# RepoDB Server

> A lightweight, self-hosted database server that uses a Git repository as its storage engine.

RepoDB is an open-source database server that stores every document as an individual JSON file inside a Git repository. Instead of relying on a traditional database engine, RepoDB uses Git as the persistence layer while exposing a simple REST API and SDK for developers.

The goal is to provide a familiar document database experience with the simplicity, versioning, and portability of Git.

> **Project Status:** 🚧 Early Development (Version 1)

---

# Features (Version 1)

* 📄 JSON document storage
* 📁 One document per file
* 📂 Collection-based organization
* 🔐 GitHub OAuth authentication
* 🔄 CRUD operations
* ⚡ In-memory LRU cache
* 🚀 Self-hosted
* 🛠️ REST API
* 📦 Official SDK (Planned)

---

# Storage Layout

Each collection is represented as a directory.

```
repository/

├── users/
│   ├── 1001.json
│   ├── 1002.json
│   └── 1003.json
│
├── products/
│   ├── 1.json
│   ├── 2.json
│   └── ...
│
├── orders/
│
└── .repodb/
    └── config.json
```

Each document is stored as an independent JSON file.

Example:

`users/1001.json`

```json
{
    "id": "1001",
    "name": "Chetan",
    "email": "chetan@example.com"
}
```

---

# Version 1 Scope

The initial release focuses only on reliable document storage.

Supported operations:

* Create Document
* Read Document
* Update Document
* Delete Document
* List Documents

Version 1 intentionally does **not** include:

* Query engine
* Secondary indexes
* Full-text search
* Transactions
* Aggregation
* Replication
* Sharding

These features are planned for future releases.

---

# Architecture

```
                REST API
                    │
                    ▼
            Collection Manager
                    │
                    ▼
             Document Manager
                    │
                    ▼
              Cache Manager
                    │
                    ▼
             GitHub Provider
                    │
                    ▼
            Git Repository
```

Each layer has a single responsibility, making the server modular and easy to extend.

---

# Why Git?

Git provides several useful properties out of the box:

* Complete version history
* Human-readable storage
* Easy backup
* Portable repositories
* Distributed architecture
* Familiar developer workflow

RepoDB builds on top of these capabilities instead of replacing them.

---

# Caching

Frequently accessed documents are stored in an in-memory LRU cache.

```
Request

↓

Cache

├── Hit  → Return immediately
└── Miss → Read from GitHub → Cache → Return
```

This minimizes GitHub API calls while improving response times.

---

# Roadmap

## Version 1

* CRUD API
* Collection management
* GitHub integration
* Document cache
* SDK

## Version 2

* Background synchronization
* Dirty document queue
* Improved cache management
* Performance optimizations

## Version 3

* Query engine
* Secondary indexes
* Filtering
* Sorting
* Pagination

## Version 4

* Transactions
* Batch operations
* Optimistic concurrency
* Advanced indexing

## Future

* GitLab support
* Gitea support
* Local Git repositories
* Pluggable storage providers
* Full-text search
* Sharding

---

# Philosophy

RepoDB is designed around a few simple principles.

* Keep storage transparent.
* Keep deployment simple.
* Use Git as the persistence layer.
* Start small and evolve incrementally.
* Make self-hosting easy.
* Hide Git complexity behind a clean developer API.

---

# Contributing

RepoDB is in its early stages, and contributions, discussions, feature ideas, and bug reports are welcome.

---

# License

MIT License
