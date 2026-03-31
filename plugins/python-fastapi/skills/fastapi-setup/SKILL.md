# Skill: fastapi-setup

## Metadata
```yaml
plugin_id: python-fastapi
plugin_version: 1.0.0
core_compatibility: >=1.0.0
```

## Purpose

指导开发者正确配置 FastAPI 项目，实现高性能异步 REST API。

核心能力：
- RESTful API 设计模式
- Pydantic 数据验证
- 异步数据库操作
- 依赖注入系统
- 自动文档生成

## When to Use

- 新建 FastAPI 项目
- 设计 REST API 结构
- 配置数据库连接
- 实现异步接口

## When Not to Use

- 纯同步项目（考虑 Flask）
- 非 Python 后端

## Implementation Process

### Step 1: 项目结构

```
project/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI 应用入口
│   ├── config.py         # 配置管理
│   ├── dependencies.py   # 依赖注入
│   ├── routers/          # 路由模块
│   │   ├── __init__.py
│   │   └── users.py
│   ├── models/           # Pydantic 模型
│   │   ├── __init__.py
│   │   └── user.py
│   ├── services/         # 业务逻辑
│   └── repositories/     # 数据访问
├── tests/
├── pyproject.toml
└── requirements.txt
```

### Step 2: 路由设计

```python
# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from ..models.user import User, UserCreate, UserUpdate
from ..services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    service: UserService = Depends()
):
    """List all users with pagination."""
    return await service.list_users(skip=skip, limit=limit)

@router.post("/", response_model=User, status_code=201)
async def create_user(
    user: UserCreate,
    service: UserService = Depends()
):
    """Create a new user."""
    return await service.create_user(user)

@router.get("/{user_id}", response_model=User)
async def get_user(user_id: int, service: UserService = Depends()):
    """Get user by ID."""
    user = await service.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

### Step 3: Pydantic 模型

```python
# app/models/user.py
from pydantic import BaseModel, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None

class User(UserBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime
```

### Step 4: 异步服务

```python
# app/services/user_service.py
from typing import List, Optional
from ..repositories.user_repo import UserRepository
from ..models.user import User, UserCreate, UserUpdate

class UserService:
    def __init__(self, repo: UserRepository = Depends()):
        self.repo = repo
    
    async def list_users(self, skip: int, limit: int) -> List[User]:
        return await self.repo.list(skip=skip, limit=limit)
    
    async def create_user(self, user: UserCreate) -> User:
        # Hash password
        hashed = hash_password(user.password)
        return await self.repo.create({
            **user.model_dump(exclude={"password"}),
            "hashed_password": hashed
        })
    
    async def get_user(self, user_id: int) -> Optional[User]:
        return await self.repo.get(user_id)
```

## Checklists

### API 设计
- [ ] RESTful 路径命名
- [ ] 正确的 HTTP 方法
- [ ] 响应模型定义
- [ ] 错误处理

### 测试
- [ ] pytest 配置
- [ ] TestClient 使用
- [ ] 异步测试支持