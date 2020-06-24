import request from '@/utils/request'

// 查询类别列表
export function listCategory(query) {
  return request({
    url: '/cms/category/list',
    method: 'get',
    params: query
  })
}

// 查询类别详细
export function getCategory(id) {
  return request({
    url: '/cms/category/' + id,
    method: 'get'
  })
}

// 新增类别
export function addCategory(data) {
  return request({
    url: '/cms/category/save',
    method: 'post',
    data: data
  })
}

// 修改类别
export function editCategory(data) {
  return request({
    url: '/cms/category/update',
    method: 'put',
    data: data
  })
}

// 删除类别
export function delCategory(id) {
  return request({
    url: '/cms/category/remove/' + id,
    method: 'delete'
  })
}

// 查询类别下拉树结构
export function categoryTree() {
  return request({
    url: '/cms/category/categoryTree',
    method: 'get'
  })
}

// 导出类别
export function exportCategory(query) {
  return request({
    url: '/cms/category/export',
    method: 'get',
    params: query
  })
}
