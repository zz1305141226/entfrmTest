import request from '@/utils/request'

// 查询文章列表
export function listArticle(query) {
  return request({
    url: '/cms/article/list',
    method: 'get',
    params: query
  })
}

// 查询类别下拉树结构
export function categoryList() {
  return request({
    url: '/cms/article/doc/categoryList',
    method: 'get'
  })
}

// 查询文档详细
export function getDoc(id) {
  return request({
    url: '/cms/article/doc/' + id,
    method: 'get'
  })
}

// 查询文章详细
export function getArticle(id) {
  return request({
    url: '/cms/article/' + id,
    method: 'get'
  })
}

// 新增文章
export function addArticle(data) {
  return request({
    url: '/cms/article/save',
    method: 'post',
    data: data
  })
}

// 修改文章
export function editArticle(data) {
  return request({
    url: '/cms/article/update',
    method: 'put',
    data: data
  })
}

// 删除文章
export function delArticle(id) {
  return request({
    url: '/cms/article/remove/' + id,
    method: 'delete'
  })
}


// 导出文章
export function exportArticle(query) {
  return request({
    url: '/cms/article/export',
    method: 'get',
    params: query
  })
}

// 上移下移
export function changeSort(id, sort) {
  const data = {
    id,
    sort
  }
  return request({
    url: '/cms/article/changeSort',
    method: 'put',
    params: data
  })
}

// 图片上传
export function uploadFile(data) {
  return request({
    url: '/common/upload',
    method: 'post',
    data: data
  })
}

