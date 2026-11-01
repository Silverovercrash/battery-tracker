"""Offline tests of the original HA handlers and storage/message format."""
import importlib.util
import json
from pathlib import Path
import sys
from types import ModuleType, SimpleNamespace
import unittest
from unittest.mock import patch

ROOT=Path(__file__).resolve().parents[1]

def load_component():
    modules={name:ModuleType(name) for name in [
        'voluptuous','homeassistant','homeassistant.components',
        'homeassistant.components.websocket_api','homeassistant.core',
        'homeassistant.helpers','homeassistant.helpers.storage']}
    modules['voluptuous'].Required=lambda value:value
    api=modules['homeassistant.components.websocket_api']
    def command(schema):
        def decorate(function):
            function.command_schema=schema
            return function
        return decorate
    api.websocket_command=command
    api.async_response=lambda function:function
    api.const=SimpleNamespace(ERR_NOT_FOUND='not_found',ERR_INVALID_FORMAT='invalid_format',ERR_UNKNOWN_ERROR='unknown_error')
    api.async_register_command=lambda hass,function:hass.commands.append(function)
    modules['homeassistant.components'].websocket_api=api
    modules['homeassistant.core'].HomeAssistant=object
    modules['homeassistant.helpers.storage'].Store=lambda hass,version,key:hass.store
    spec=importlib.util.spec_from_file_location('tracker_under_test',ROOT/'custom_components/akku_tracker/__init__.py')
    module=importlib.util.module_from_spec(spec)
    with patch.dict(sys.modules,modules):spec.loader.exec_module(module)
    return module

component=load_component()
def empty():return {'batteries':[],'devices':[],'history':[]}

class FakeStore:
    def __init__(self,data=None):self.loaded=data;self.writes=[];self.fail=False
    async def async_load(self):return self.loaded
    async def async_save(self,data):
        if self.fail:raise OSError('simulated disk failure')
        self.writes.append(json.loads(json.dumps(data)))

class FakeHass:
    def __init__(self,data=None):
        self.data={};self.store=FakeStore(data);self.commands=[];self.events=[]
        self.bus=SimpleNamespace(async_fire=lambda name,data:self.events.append((name,data)))
    async def async_add_executor_job(self,function):return function()

class FakeConnection:
    def __init__(self):
        self.user=SimpleNamespace(id='test-user',is_admin=False)
        self.results=[];self.errors=[]
    def send_result(self,identity,data):self.results.append((identity,data))
    def send_error(self,identity,code,message):self.errors.append((identity,code,message))

class ValidationTests(unittest.TestCase):
    def test_fresh_default_is_empty(self):self.assertEqual(component._load_default_data(),empty())
    def test_valid_shape(self):self.assertIsNone(component._validate_data(empty()))
    def test_missing_section(self):self.assertIsNotNone(component._validate_data({'batteries':[]}))
    def test_non_object(self):self.assertIsNotNone(component._validate_data([]))
    def test_non_record(self):
        data=empty();data['batteries']=['invalid'];self.assertIsNotNone(component._validate_data(data))
    def test_count_limit(self):
        data=empty();data['batteries']=[{}]*5001;self.assertIsNotNone(component._validate_data(data))
    def test_non_finite_number(self):
        data=empty();data['batteries']=[{'voltage':float('nan')}];self.assertIsNotNone(component._validate_data(data))
    def test_size_limit(self):
        data=empty();data['batteries']=[{'note':'x'*2_000_001}];self.assertIsNotNone(component._validate_data(data))
    def test_original_save_schema(self):
        self.assertEqual(set(component.websocket_save.command_schema),{'type','data'})

class HandlerTests(unittest.IsolatedAsyncioTestCase):
    async def test_setup_preserves_plain_store(self):
        stored=empty();stored['batteries']=[{'id':'TEST-1','status':'Reserve / bereit'}]
        hass=FakeHass(stored)
        self.assertTrue(await component.async_setup(hass,{}))
        self.assertEqual(hass.data['akku_tracker']['data'],stored)
        self.assertEqual(hass.store.writes,[])
        self.assertEqual(len(hass.commands),2)
    async def test_fresh_setup_uses_empty_store(self):
        hass=FakeHass();await component.async_setup(hass,{})
        self.assertEqual(hass.store.writes,[empty()])
    async def test_get_has_original_response(self):
        hass=FakeHass(empty());await component.async_setup(hass,{})
        connection=FakeConnection();await component.websocket_get(hass,connection,{'id':1})
        self.assertEqual(connection.results,[(1,{'data':empty()})])
    async def test_authenticated_non_admin_can_save_without_revision(self):
        hass=FakeHass(empty());await component.async_setup(hass,{})
        data=empty();data['batteries']=[{'id':'TEST-1','status':'Reserve / bereit'}]
        connection=FakeConnection()
        await component.websocket_save(hass,connection,{'id':2,'type':'akku_tracker/save','data':data})
        self.assertEqual(connection.errors,[])
        self.assertEqual(connection.results,[(2,{'saved':True})])
        self.assertEqual(hass.store.writes,[data])
        self.assertEqual(hass.events,[('akku_tracker_updated',{'data':data,'user_id':'test-user'})])
    async def test_save_failure_keeps_previous_inventory(self):
        hass=FakeHass(empty());await component.async_setup(hass,{})
        hass.store.fail=True;connection=FakeConnection()
        data=empty();data['batteries']=[{'id':'TEST-1'}]
        await component.websocket_save(hass,connection,{'id':3,'data':data})
        self.assertEqual(hass.data['akku_tracker']['data'],empty())
        self.assertEqual(connection.results,[])
        self.assertEqual(connection.errors[0][1],'unknown_error')
        self.assertEqual(hass.events,[])
    async def test_invalid_save_never_writes(self):
        hass=FakeHass(empty());await component.async_setup(hass,{})
        connection=FakeConnection();await component.websocket_save(hass,connection,{'id':4,'data':{}})
        self.assertEqual(hass.store.writes,[])
        self.assertEqual(connection.errors[0][1],'invalid_format')
    async def test_missing_component(self):
        hass=FakeHass();connection=FakeConnection()
        await component.websocket_get(hass,connection,{'id':5})
        self.assertEqual(connection.errors[0][1],'not_found')

if __name__=='__main__':unittest.main(verbosity=2)
