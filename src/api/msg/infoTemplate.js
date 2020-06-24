import request from '@/utils/request'

// 查询消息模板列表
export function listInfoTemplate(query) {
  return request({
    url: '/msg/infoTemplate/list',
    method: 'get',
    params: query
  })
}

// 查询消息模板详细
export function getInfoTemplate(id) {
  return request({
    url: '/msg/infoTemplate/' + id,
    method: 'get'
  })
}

// 新增消息模板
export function addInfoTemplate(data) {
  return request({
    url: '/msg/infoTemplate/save',
    method: 'post',
    data: data
  })
}

// 修改消息模板
export function editInfoTemplate(data) {
  return request({
    url: '/msg/infoTemplate/update',
    method: 'put',
    data: data
  })
}

// 删除消息模板
export function delInfoTemplate(id) {
  return request({
    url: '/msg/infoTemplate/remove/' + id,
    method: 'delete'
  })
}


// 导出消息模板
export function exportInfoTemplate(query) {
  return request({
    url: '/msg/infoTemplate/export',
    method: 'get',
    params: query
  })
}
